import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PostRowActions from "@/components/admin/post-row-actions";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import type { PostRow, BlogRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Posts" };

export const revalidate = 0;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ blog?: string; status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  // Fetch blogs for filter
  const { data: blogs } = await supabase
    .from("blogs")
    .select("*")
    .order("name");

  // Build query
  let query = supabase
    .from("posts")
    .select("*, blogs(id, slug, name)")
    .order("updated_at", { ascending: false });

  if (sp.blog) query = query.eq("blog_id", sp.blog);
  if (sp.status) query = query.eq("status", sp.status);
  if (sp.q) query = query.ilike("title", `%${sp.q}%`);

  const { data: posts } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link href="/admin/posts/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="size-4" />
          New post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterLink href="/admin/posts" active={!sp.blog && !sp.status} label="All" />
        {blogs?.map((b: BlogRow) => (
          <FilterLink
            key={b.id}
            href={`/admin/posts?blog=${b.id}`}
            active={sp.blog === b.id}
            label={b.name}
          />
        ))}
        <div className="w-px bg-border self-stretch mx-1" />
        <FilterLink href="/admin/posts?status=published" active={sp.status === "published"} label="Published" />
        <FilterLink href="/admin/posts?status=draft" active={sp.status === "draft"} label="Drafts" />
      </div>

      {posts && posts.length > 0 ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Blog</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post: PostRow & { blogs: BlogRow | null }) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {post.title || <span className="text-muted-foreground italic">Untitled</span>}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.blogs?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    {post.status === "published" && post.publish_at && new Date(post.publish_at) > new Date() ? (
                      <Badge variant="outline">Scheduled</Badge>
                    ) : (
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>
                        {post.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(post.updated_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <PostRowActions post={post} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <p className="font-medium">No posts yet</p>
          <p className="text-sm mt-1">Create your first post to get started.</p>
        </div>
      )}
    </div>
  );
}

function FilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
