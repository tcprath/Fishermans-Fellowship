import { createClient } from "@/lib/supabase/server";
import type {
  BlogRow,
  PostRow,
  DevotionalRow,
  EventRow,
  TagRow,
  PostWithTags,
  DevotionalWithTags,
  ResourceRow,
  ResourceWithTags,
  ResourceType,
} from "@/lib/supabase/types";

type WithTagJoin = { tags: TagRow | null }[] | null;

function flattenTags<T extends {
  post_tags?: WithTagJoin;
  devotional_tags?: WithTagJoin;
  resource_tags?: WithTagJoin;
}>(row: T): TagRow[] {
  const join = row.post_tags ?? row.devotional_tags ?? row.resource_tags ?? [];
  return (join ?? []).map((r) => r.tags).filter((t): t is TagRow => !!t);
}

// ── Blogs ────────────────────────────────────────────────────────────────────

export async function getBlogBySlug(slug: string): Promise<BlogRow | null> {
  const sb = await createClient();
  const { data } = await sb.from("blogs").select("*").eq("slug", slug).single();
  return data ?? null;
}

export async function getAllBlogs(): Promise<BlogRow[]> {
  const sb = await createClient();
  const { data } = await sb.from("blogs").select("*").order("name");
  return data ?? [];
}

// ── Posts ────────────────────────────────────────────────────────────────────

export async function getPublishedPostsByBlog(
  blogId: string,
  tagSlug?: string,
  q?: string
): Promise<PostWithTags[]> {
  const sb = await createClient();
  const now = new Date().toISOString();

  let postIds: string[] | null = null;
  if (tagSlug) {
    const { data: tag } = await sb.from("tags").select("id").eq("slug", tagSlug).maybeSingle();
    if (!tag) return [];
    const { data: rels } = await sb.from("post_tags").select("post_id").eq("tag_id", tag.id);
    postIds = (rels ?? []).map((r) => r.post_id as string);
    if (postIds.length === 0) return [];
  }

  let query = sb
    .from("posts")
    .select("*, post_tags(tags(*))")
    .eq("blog_id", blogId)
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("published_at", { ascending: false });
  if (postIds) query = query.in("id", postIds);
  if (q && q.trim()) {
    const term = q.trim().replace(/[%_]/g, "");
    query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
  }

  const { data } = await query;
  return (data ?? []).map((p) => ({ ...(p as PostRow), tags: flattenTags(p as never) }));
}

export async function getRelatedPosts(
  blogId: string,
  excludePostId: string,
  tagIds: string[],
  limit = 4
): Promise<PostWithTags[]> {
  const sb = await createClient();
  const now = new Date().toISOString();

  if (tagIds.length > 0) {
    const { data: rels } = await sb
      .from("post_tags")
      .select("post_id")
      .in("tag_id", tagIds);
    const ids = Array.from(new Set((rels ?? []).map((r) => r.post_id as string)))
      .filter((id) => id !== excludePostId);
    if (ids.length > 0) {
      const { data } = await sb
        .from("posts")
        .select("*, post_tags(tags(*))")
        .in("id", ids)
        .eq("blog_id", blogId)
        .eq("status", "published")
        .or(`publish_at.is.null,publish_at.lte.${now}`)
        .order("published_at", { ascending: false })
        .limit(limit);
      const mapped = (data ?? []).map((p) => ({ ...(p as PostRow), tags: flattenTags(p as never) }));
      if (mapped.length > 0) return mapped;
    }
  }

  // Fallback: most recent in same blog
  const { data } = await sb
    .from("posts")
    .select("*, post_tags(tags(*))")
    .eq("blog_id", blogId)
    .eq("status", "published")
    .neq("id", excludePostId)
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((p) => ({ ...(p as PostRow), tags: flattenTags(p as never) }));
}

export async function getPostBySlug(
  blogId: string,
  slug: string
): Promise<PostWithTags | null> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("posts")
    .select("*, post_tags(tags(*))")
    .eq("blog_id", blogId)
    .eq("slug", slug)
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .single();
  if (!data) return null;
  return { ...(data as PostRow), tags: flattenTags(data as never) };
}

export async function getRecentPostsAcrossBlogs(
  limit = 4
): Promise<(PostWithTags & { blog_slug: string })[]> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("posts")
    .select("*, blogs!inner(slug), post_tags(tags(*))")
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((p) => ({
    ...(p as PostRow),
    blog_slug: (p.blogs as { slug: string }).slug,
    tags: flattenTags(p as never),
  }));
}

// ── Devotionals ──────────────────────────────────────────────────────────────

export async function getPublishedDevotionals(
  tagSlug?: string,
  q?: string
): Promise<DevotionalWithTags[]> {
  const sb = await createClient();
  const now = new Date().toISOString();

  let devIds: string[] | null = null;
  if (tagSlug) {
    const { data: tag } = await sb.from("tags").select("id").eq("slug", tagSlug).maybeSingle();
    if (!tag) return [];
    const { data: rels } = await sb.from("devotional_tags").select("devotional_id").eq("tag_id", tag.id);
    devIds = (rels ?? []).map((r) => r.devotional_id as string);
    if (devIds.length === 0) return [];
  }

  let query = sb
    .from("devotionals")
    .select("*, devotional_tags(tags(*))")
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("published_at", { ascending: true })
    .order("slug", { ascending: true });
  if (devIds) query = query.in("id", devIds);
  if (q && q.trim()) {
    const term = q.trim().replace(/[%_]/g, "");
    query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,scripture.ilike.%${term}%`);
  }

  const { data } = await query;
  return (data ?? []).map((d) => ({ ...(d as DevotionalRow), tags: flattenTags(d as never) }));
}

export async function getRelatedDevotionals(
  excludeId: string,
  tagIds: string[],
  limit = 4
): Promise<DevotionalWithTags[]> {
  const sb = await createClient();
  const now = new Date().toISOString();

  if (tagIds.length > 0) {
    const { data: rels } = await sb
      .from("devotional_tags")
      .select("devotional_id")
      .in("tag_id", tagIds);
    const ids = Array.from(
      new Set((rels ?? []).map((r) => r.devotional_id as string))
    ).filter((id) => id !== excludeId);
    if (ids.length > 0) {
      const { data } = await sb
        .from("devotionals")
        .select("*, devotional_tags(tags(*))")
        .in("id", ids)
        .eq("status", "published")
        .or(`publish_at.is.null,publish_at.lte.${now}`)
        .order("published_at", { ascending: false })
        .limit(limit);
      const mapped = (data ?? []).map((d) => ({ ...(d as DevotionalRow), tags: flattenTags(d as never) }));
      if (mapped.length > 0) return mapped;
    }
  }

  const { data } = await sb
    .from("devotionals")
    .select("*, devotional_tags(tags(*))")
    .eq("status", "published")
    .neq("id", excludeId)
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((d) => ({ ...(d as DevotionalRow), tags: flattenTags(d as never) }));
}

export async function getPublishedDevotionalStubs(): Promise<
  Pick<DevotionalRow, "id" | "slug" | "cal_month" | "cal_day">[]
> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("devotionals")
    .select("id, slug, cal_month, cal_day")
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`);
  return data ?? [];
}

export async function getRecentDevotionals(limit = 3): Promise<DevotionalWithTags[]> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("devotionals")
    .select("*, devotional_tags(tags(*))")
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((d) => ({ ...(d as DevotionalRow), tags: flattenTags(d as never) }));
}

export async function getDevotionalBySlug(
  slug: string
): Promise<DevotionalWithTags | null> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("devotionals")
    .select("*, devotional_tags(tags(*))")
    .eq("slug", slug)
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .single();
  if (!data) return null;
  return { ...(data as DevotionalRow), tags: flattenTags(data as never) };
}

// ── Tags ─────────────────────────────────────────────────────────────────────

export async function getAllPublicTags(): Promise<TagRow[]> {
  const sb = await createClient();
  const { data } = await sb.from("tags").select("*").order("name");
  return (data ?? []) as TagRow[];
}

export async function getTagsForPostsInBlog(blogId: string): Promise<TagRow[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("post_tags")
    .select("tags(*), posts!inner(blog_id, status)")
    .eq("posts.blog_id", blogId)
    .eq("posts.status", "published");
  const seen = new Map<string, TagRow>();
  for (const r of (data ?? []) as unknown as { tags: TagRow | null }[]) {
    if (r.tags) seen.set(r.tags.id, r.tags);
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTagsForDevotionals(): Promise<TagRow[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("devotional_tags")
    .select("tags(*), devotionals!inner(status)")
    .eq("devotionals.status", "published");
  const seen = new Map<string, TagRow>();
  for (const r of (data ?? []) as unknown as { tags: TagRow | null }[]) {
    if (r.tags) seen.set(r.tags.id, r.tags);
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// ── Events ───────────────────────────────────────────────────────────────────

export async function getPublishedEvents(): Promise<EventRow[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("starts_at", { ascending: true });
  return data ?? [];
}

export async function getEventById(id: string): Promise<EventRow | null> {
  const sb = await createClient();
  const { data } = await sb.from("events").select("*").eq("id", id).single();
  return data ?? null;
}

// ── Resources ────────────────────────────────────────────────────────────────

export async function getPublishedResources(
  opts: { type?: ResourceType; tagSlug?: string } = {}
): Promise<ResourceWithTags[]> {
  const sb = await createClient();
  const now = new Date().toISOString();

  let resourceIds: string[] | null = null;
  if (opts.tagSlug) {
    const { data: tag } = await sb.from("tags").select("id").eq("slug", opts.tagSlug).maybeSingle();
    if (!tag) return [];
    const { data: rels } = await sb.from("resource_tags").select("resource_id").eq("tag_id", tag.id);
    resourceIds = (rels ?? []).map((r) => r.resource_id as string);
    if (resourceIds.length === 0) return [];
  }

  let query = sb
    .from("resources")
    .select("*, resource_tags(tags(*))")
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });
  if (opts.type) query = query.eq("type", opts.type);
  if (resourceIds) query = query.in("id", resourceIds);

  const { data } = await query;
  return (data ?? []).map((r) => ({ ...(r as ResourceRow), tags: flattenTags(r as never) }));
}

export async function getResourceBySlug(slug: string): Promise<ResourceWithTags | null> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("resources")
    .select("*, resource_tags(tags(*))")
    .eq("slug", slug)
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .single();
  if (!data) return null;
  return { ...(data as ResourceRow), tags: flattenTags(data as never) };
}

export async function getTagsForResources(): Promise<TagRow[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("resource_tags")
    .select("tags(*), resources!inner(status)")
    .eq("resources.status", "published");
  const seen = new Map<string, TagRow>();
  for (const r of (data ?? []) as unknown as { tags: TagRow | null }[]) {
    if (r.tags) seen.set(r.tags.id, r.tags);
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}
