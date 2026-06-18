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
import { upsertDevotional, deleteDevotional } from "@/app/(admin)/admin/devotionals/actions";
import type { DevotionalRow } from "@/lib/supabase/types";
import { MoreHorizontal, Pencil, Eye, EyeOff, Trash2 } from "lucide-react";

export default function DevotionalRowActions({ devotional }: { devotional: DevotionalRow }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleTogglePublish() {
    const newStatus = devotional.status === "published" ? "draft" : "published";
    if (newStatus === "published" && !devotional.image_url) {
      toast.error("An image is required to publish a devotional");
      return;
    }
    startTransition(async () => {
      const result = await upsertDevotional({
        id: devotional.id,
        title: devotional.title,
        slug: devotional.slug,
        scripture: devotional.scripture ?? undefined,
        excerpt: devotional.excerpt ?? undefined,
        body_html: devotional.body_html ?? undefined,
        image_url: devotional.image_url,
        status: newStatus,
      });
      if (!result.success) { toast.error(result.error); return; }
      toast.success(newStatus === "published" ? "Published" : "Unpublished");
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteDevotional(devotional.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Devotional deleted");
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
          <DropdownMenuItem onClick={() => router.push(`/admin/devotionals/${devotional.id}`)}>
            <Pencil className="size-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleTogglePublish}>
            {devotional.status === "published" ? (
              <><EyeOff className="size-3.5" /> Unpublish</>
            ) : (
              <><Eye className="size-3.5" /> Publish</>
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
            <DialogTitle>Delete devotional?</DialogTitle>
            <DialogDescription>
              Permanently deletes &ldquo;{devotional.title}&rdquo;. Cannot be undone.
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
