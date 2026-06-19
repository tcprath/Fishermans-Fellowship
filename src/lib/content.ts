import { createClient } from "@/lib/supabase/server";
import type { BlogRow, PostRow, DevotionalRow, EventRow } from "@/lib/supabase/types";

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

export async function getPublishedPostsByBlog(blogId: string): Promise<PostRow[]> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("posts")
    .select("*")
    .eq("blog_id", blogId)
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("published_at", { ascending: false });
  return data ?? [];
}

export async function getPostBySlug(
  blogId: string,
  slug: string
): Promise<PostRow | null> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("posts")
    .select("*")
    .eq("blog_id", blogId)
    .eq("slug", slug)
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .single();
  return data ?? null;
}

export async function getRecentPostsAcrossBlogs(
  limit = 4
): Promise<(PostRow & { blog_slug: string })[]> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("posts")
    .select("*, blogs!inner(slug)")
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((p) => ({
    ...p,
    blog_slug: (p.blogs as { slug: string }).slug,
  }));
}

// ── Devotionals ──────────────────────────────────────────────────────────────

export async function getPublishedDevotionals(): Promise<DevotionalRow[]> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("devotionals")
    .select("*")
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("published_at", { ascending: true })
    .order("slug", { ascending: true });
  return data ?? [];
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

export async function getRecentDevotionals(limit = 3): Promise<DevotionalRow[]> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("devotionals")
    .select("*")
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("published_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getDevotionalBySlug(
  slug: string
): Promise<DevotionalRow | null> {
  const sb = await createClient();
  const now = new Date().toISOString();
  const { data } = await sb
    .from("devotionals")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .single();
  return data ?? null;
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
