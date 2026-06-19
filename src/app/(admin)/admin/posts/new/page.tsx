import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PostForm from "@/components/admin/post-form";
import { listTags } from "@/app/(admin)/admin/tags/actions";
import type { BlogRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "New Post" };

export default async function NewPostPage() {
  const supabase = await createClient();
  const [{ data: blogs }, allTags] = await Promise.all([
    supabase.from("blogs").select("*").order("name"),
    listTags(),
  ]);

  return <PostForm blogs={(blogs as BlogRow[]) ?? []} allTags={allTags} />;
}
