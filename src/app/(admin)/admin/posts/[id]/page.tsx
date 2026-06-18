import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostForm from "@/components/admin/post-form";
import type { BlogRow, PostRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Edit Post" };

export const revalidate = 0;

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: post }, { data: blogs }] = await Promise.all([
    supabase
      .from("posts")
      .select("*, blogs(id, slug, name)")
      .eq("id", id)
      .single(),
    supabase.from("blogs").select("*").order("name"),
  ]);

  if (!post) notFound();

  return (
    <PostForm
      blogs={(blogs as BlogRow[]) ?? []}
      post={post as PostRow & { blog?: BlogRow }}
    />
  );
}
