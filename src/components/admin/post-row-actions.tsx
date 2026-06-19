"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { upsertPost, deletePost } from "@/app/(admin)/admin/posts/actions";
import type { PostRow, BlogRow } from "@/lib/supabase/types";
import { MoreHorizontal, Pencil, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";

export default function PostRowActions({
  post,
}: {
  post: PostRow & { blogs?: BlogRow | null };
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleTogglePublish() {
    const newStatus = post.status === "published" ? "draft" : "published";
    startTransition(async () => {
      const result = await upsertPost({
        id: post.id,
        blog_id: post.blog_id,
        blog_slug: (post.blogs as BlogRow | null)?.slug,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? undefined,
        body_html: post.body_html ?? undefined,
        hero_image_url: post.hero_image_url ?? undefined,
        author: post.author ?? undefined,
        status: newStatus,
      });
      if (!result.success) { toast.error(result.error); return; }
      toast.success(newStatus === "published" ? "Published" : "Unpublished");
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Post deleted");
      setDeleteOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          disabled={isPending}
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/posts/${post.id}`)}>
            <Pencil className="size-3.5" />
            Edit
          </DropdownMenuItem>
          {post.status === "published" && post.blogs?.slug && (
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  `/${post.blogs!.slug}/${post.slug}`,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              <ExternalLink className="size-3.5" />
              View on site
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleTogglePublish}>
            {post.status === "published" ? (
              <>
                <EyeOff className="size-3.5" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="size-3.5" />
                Publish
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              Permanently deletes &ldquo;{post.title}&rdquo;. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
