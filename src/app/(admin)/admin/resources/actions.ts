"use server";

import { createClient } from "@/lib/supabase/server";
import { sanitize } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ResourceActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

const schema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(1, "Title required"),
    slug: z.string().min(1, "Slug required"),
    description: z.string().optional(),
    body_html: z.string().optional(),
    type: z.enum(["post", "book", "video", "podcast", "study", "article", "link"]),
    url: z.string().optional(),
    image_url: z.string().optional(),
    author: z.string().optional(),
    scripture: z.string().optional(),
    featured: z.boolean().optional(),
    status: z.enum(["draft", "published"]),
    publish_at: z.string().nullable().optional(),
    tag_ids: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      ["post", "study"].includes(data.type) ||
      (data.url && /^https?:\/\//.test(data.url)),
    { message: "Valid URL required for external resources", path: ["url"] }
  );

async function getAuthClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

async function syncResourceTags(
  supabase: Awaited<ReturnType<typeof getAuthClient>>,
  resourceId: string,
  tagIds: string[]
) {
  await supabase.from("resource_tags").delete().eq("resource_id", resourceId);
  if (tagIds.length === 0) return;
  await supabase
    .from("resource_tags")
    .insert(tagIds.map((tag_id) => ({ resource_id: resourceId, tag_id })));
}

function revalidateResourcePaths(slug?: string) {
  revalidatePath("/resources");
  revalidatePath("/");
  if (slug) revalidatePath(`/resources/${slug}`);
}

export async function upsertResource(
  input: z.infer<typeof schema>
): Promise<ResourceActionResult> {
  try {
    const supabase = await getAuthClient();
    const data = schema.parse(input);

    const body_html = ["post", "study"].includes(data.type) && data.body_html
      ? sanitize(data.body_html)
      : null;
    const url = ["post", "study"].includes(data.type)
      ? null
      : (data.url ?? null);
    const scripture = data.type === "study" ? (data.scripture ?? null) : null;

    if (data.id) {
      const { data: existing } = await supabase
        .from("resources")
        .select("published_at")
        .eq("id", data.id)
        .single();

      const published_at =
        data.status === "published" && !existing?.published_at
          ? new Date().toISOString()
          : existing?.published_at ?? null;

      const { error } = await supabase
        .from("resources")
        .update({
          title: data.title,
          slug: data.slug,
          description: data.description ?? null,
          body_html,
          type: data.type,
          url,
          image_url: data.image_url ?? null,
          author: data.author ?? null,
          scripture,
          featured: data.featured ?? false,
          status: data.status,
          published_at,
          publish_at: data.publish_at ?? null,
        })
        .eq("id", data.id);

      if (error) return { success: false, error: error.message };

      await syncResourceTags(supabase, data.id, data.tag_ids ?? []);
      revalidateResourcePaths(data.slug);
      return { success: true, id: data.id };
    } else {
      const { data: created, error } = await supabase
        .from("resources")
        .insert({
          title: data.title,
          slug: data.slug,
          description: data.description ?? null,
          body_html,
          type: data.type,
          url,
          image_url: data.image_url ?? null,
          author: data.author ?? null,
          scripture,
          featured: data.featured ?? false,
          status: data.status,
          published_at: data.status === "published" ? new Date().toISOString() : null,
          publish_at: data.publish_at ?? null,
        })
        .select("id")
        .single();

      if (error) return { success: false, error: error.message };

      await syncResourceTags(supabase, created.id, data.tag_ids ?? []);
      revalidateResourcePaths(data.slug);
      return { success: true, id: created.id };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteResource(id: string): Promise<ResourceActionResult> {
  try {
    const supabase = await getAuthClient();
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidateResourcePaths();
    return { success: true, id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
