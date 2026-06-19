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
  cal_month: z.number().int().min(1).max(12).nullable().optional(),
  cal_day: z.number().int().min(1).max(31).nullable().optional(),
  status: z.enum(["draft", "published"]),
  publish_at: z.string().nullable().optional(),
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
          image_url: data.image_url ?? null,
          cal_month: data.cal_month ?? null,
          cal_day: data.cal_day ?? null,
          status: data.status,
          published_at,
          publish_at: data.publish_at ?? null,
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
          image_url: data.image_url ?? null,
          cal_month: data.cal_month ?? null,
          cal_day: data.cal_day ?? null,
          status: data.status,
          published_at: data.status === "published" ? new Date().toISOString() : null,
          publish_at: data.publish_at ?? null,
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
