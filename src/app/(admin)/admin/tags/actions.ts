"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { TagRow } from "@/lib/supabase/types";

export type TagResult =
  | { success: true; tag: TagRow }
  | { success: false; error: string };

async function getAuthClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

function toTagSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const createSchema = z.object({
  name: z.string().min(1, "Name required").max(50),
});

export async function createTag(input: z.infer<typeof createSchema>): Promise<TagResult> {
  try {
    const supabase = await getAuthClient();
    const { name } = createSchema.parse(input);
    const slug = toTagSlug(name);
    if (!slug) return { success: false, error: "Invalid tag name" };

    const { data: existing } = await supabase
      .from("tags")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) return { success: true, tag: existing as TagRow };

    const { data, error } = await supabase
      .from("tags")
      .insert({ slug, name: name.trim() })
      .select("*")
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, tag: data as TagRow };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function listTags(): Promise<TagRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("*").order("name");
  return (data ?? []) as TagRow[];
}
