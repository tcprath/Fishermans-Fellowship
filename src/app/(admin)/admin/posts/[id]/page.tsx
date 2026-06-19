import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostForm from "@/components/admin/post-form";
import { listTags } from "@/app/(admin)/admin/tags/actions";
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

  const [{ data: post }, { data: blogs }, { data: postTags }, allTags] = await Promise.all([
    supabase
      .from("posts")
      .select("*, blogs(id, slug, name)")
      .eq("id", id)
      .single(),
    supabase.from("blogs").select("*").order("name"),
    supabase.from("post_tags").select("tag_id").eq("post_id", id),
    listTags(),
  ]);

  if (!post) notFound();

  const initialTagIds = (postTags ?? []).map((r) => r.tag_id as string);

  return (
    <PostForm
      blogs={(blogs as BlogRow[]) ?? []}
      post={post as PostRow & { blog?: BlogRow }}
      allTags={allTags}
      initialTagIds={initialTagIds}
    />
  );
}
