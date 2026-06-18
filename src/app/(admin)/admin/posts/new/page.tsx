import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PostForm from "@/components/admin/post-form";
import type { BlogRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "New Post" };

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: blogs } = await supabase
    .from("blogs")
    .select("*")
    .order("name");

  return <PostForm blogs={(blogs as BlogRow[]) ?? []} />;
}
