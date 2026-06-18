"use server";

import { createClient } from "@/lib/supabase/server";
import { sanitize } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type DevotionalActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title required"),
  slug: z.string().min(1, "Slug required"),
  scripture: z.string().optional(),
  excerpt: z.string().optional(),
  body_html: z.string().optional(),
  image_url: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

async function getAuthClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

function revalidateDevotionalPaths(slug?: string) {
  revalidatePath("/devotionals");
  revalidatePath("/fishermans-fellowship");
  revalidatePath("/fishermans-fellowship/rss.xml");
  revalidatePath("/rss.xml");
  revalidatePath("/");
  if (slug) revalidatePath(`/devotionals/${slug}`);
}

export async function upsertDevotional(
  input: z.infer<typeof schema>
): Promise<DevotionalActionResult> {
  try {
    const supabase = await getAuthClient();
    const data = schema.parse(input);

    if (data.status === "published" && !data.image_url) {
      return { success: false, error: "Image is required to publish a devotional" };
    }

    const body_html = data.body_html ? sanitize(data.body_html) : "";

    if (data.id) {
      const { data: existing } = await supabase
        .from("devotionals")
        .select("published_at")
        .eq("id", data.id)
        .single();

      const published_at =
        data.status === "published" && !existing?.published_at
          ? new Date().toISOString()
          : existing?.published_at ?? null;

      const { error } = await supabase
        .from("devotionals")
        .update({
          title: data.title,
          slug: data.slug,
          scripture: data.scripture ?? null,
          excerpt: data.excerpt ?? null,
          body_html,
          image_url: data.image_url ?? "",
          status: data.status,
          published_at,
        })
        .eq("id", data.id);

      if (error) return { success: false, error: error.message };

      revalidateDevotionalPaths(data.slug);
      return { success: true, id: data.id };
    } else {
      const { data: created, error } = await supabase
        .from("devotionals")
        .insert({
          title: data.title,
          slug: data.slug,
          scripture: data.scripture ?? null,
          excerpt: data.excerpt ?? null,
          body_html,
          image_url: data.image_url ?? "",
          status: data.status,
          published_at: data.status === "published" ? new Date().toISOString() : null,
        })
        .select("id")
        .single();

      if (error) return { success: false, error: error.message };

      revalidateDevotionalPaths(data.slug);
      return { success: true, id: created.id };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function deleteDevotional(id: string): Promise<DevotionalActionResult> {
  try {
    const supabase = await getAuthClient();
    const { error } = await supabase.from("devotionals").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidateDevotionalPaths();
    return { success: true, id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
