"use server";

import { createClient } from "@/lib/supabase/server";
import { sanitize } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type PostActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

const schema = z.object({
  id: z.string().optional(),
  blog_id: z.string().min(1, "Blog required"),
  title: z.string().min(1, "Title required"),
  slug: z.string().min(1, "Slug required"),
  excerpt: z.string().optional(),
  body_html: z.string().optional(),
  hero_image_url: z.string().optional(),
  author: z.string().optional(),
  status: z.enum(["draft", "published"]),
  publish_at: z.string().nullable().optional(),
  tag_ids: z.array(z.string()).optional(),
  blog_slug: z.string().optional(), // for revalidation
});

async function syncPostTags(
  supabase: Awaited<ReturnType<typeof getAuthClient>>,
  postId: string,
  tagIds: string[]
) {
  await supabase.from("post_tags").delete().eq("post_id", postId);
  if (tagIds.length === 0) return;
  await supabase
    .from("post_tags")
    .insert(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
}

async function getAuthClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

function revalidatePostPaths(blogSlug?: string) {
  if (blogSlug) {
    revalidatePath(`/${blogSlug}`);
    revalidatePath(`/${blogSlug}/rss.xml`);
  } else {
    revalidatePath("/fishermans-fellowship");
    revalidatePath("/rise-up-gods-way");
    revalidatePath("/fishermans-fellowship/rss.xml");
    revalidatePath("/rise-up-gods-way/rss.xml");
  }
  revalidatePath("/rss.xml");
  revalidatePath("/");
}

export async function upsertPost(
  input: z.infer<typeof schema>
): Promise<PostActionResult> {
  try {
    const supabase = await getAuthClient();
    const data = schema.parse(input);

    const body_html = data.body_html ? sanitize(data.body_html) : "";

    if (data.id) {
      // Update existing post
      const { data: existing } = await supabase
        .from("posts")
        .select("published_at, status")
        .eq("id", data.id)
        .single();

      const published_at =
        data.status === "published" && !existing?.published_at
          ? new Date().toISOString()
          : existing?.published_at ?? null;

      const { error } = await supabase
        .from("posts")
        .update({
          blog_id: data.blog_id,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt ?? null,
          body_html,
          hero_image_url: data.hero_image_url ?? null,
          author: data.author ?? null,
          status: data.status,
          published_at,
          publish_at: data.publish_at ?? null,
        })
        .eq("id", data.id);

      if (error) return { success: false, error: error.message };

      await syncPostTags(supabase, data.id, data.tag_ids ?? []);

      revalidatePostPaths(data.blog_slug);
      revalidatePath(`/${data.blog_slug}/${data.slug}`);
      return { success: true, id: data.id };
    } else {
      // Create new post
      const { data: created, error } = await supabase
        .from("posts")
        .insert({
          blog_id: data.blog_id,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt ?? null,
          body_html,
          hero_image_url: data.hero_image_url ?? null,
          author: data.author ?? null,
          status: data.status,
          published_at: data.status === "published" ? new Date().toISOString() : null,
          publish_at: data.publish_at ?? null,
        })
        .select("id")
        .single();

      if (error) return { success: false, error: error.message };

      await syncPostTags(supabase, created.id, data.tag_ids ?? []);

      revalidatePostPaths(data.blog_slug);
      return { success: true, id: created.id };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function deletePost(id: string): Promise<PostActionResult> {
  try {
    const supabase = await getAuthClient();

    // Fetch blog slug before deleting for revalidation
    const { data: post } = await supabase
      .from("posts")
      .select("slug, blogs(slug)")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    const blogSlug = (post?.blogs as unknown as { slug: string } | null)?.slug;
    revalidatePostPaths(blogSlug);
    return { success: true, id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
