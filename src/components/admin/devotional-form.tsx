"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RichEditor from "@/components/admin/rich-editor";
import ImageUpload from "@/components/admin/image-upload";
import { upsertDevotional, deleteDevotional } from "@/app/(admin)/admin/devotionals/actions";
import type { DevotionalRow } from "@/lib/supabase/types";
import { ExternalLink, Trash2, AlertCircle } from "lucide-react";

interface DevotionalFormProps {
  devotional?: DevotionalRow;
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default function DevotionalForm({ devotional }: DevotionalFormProps) {
  const router = useRouter();
  const isNew = !devotional;

  const [title, setTitle] = useState(devotional?.title ?? "");
  const [slug, setSlug] = useState(devotional?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!isNew);
  const [scripture, setScripture] = useState(devotional?.scripture ?? "");
  const [excerpt, setExcerpt] = useState(devotional?.excerpt ?? "");
  const [bodyHtml, setBodyHtml] = useState(devotional?.body_html ?? "");
  const [imageUrl, setImageUrl] = useState(devotional?.image_url ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!slugManual) setSlug(toSlug(title));
  }, [title, slugManual]);

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManual(true);
    setSlug(e.target.value);
  }

  async function handleSave(status: "draft" | "published") {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!slug.trim()) { toast.error("Slug is required"); return; }
    if (status === "published" && !imageUrl) {
      toast.error("An image is required before publishing");
      return;
    }

    startTransition(async () => {
      const result = await upsertDevotional({
        id: devotional?.id,
        title,
        slug: slug.trim(),
        scripture: scripture || undefined,
        excerpt: excerpt || undefined,
        body_html: bodyHtml || undefined,
        image_url: imageUrl || undefined,
        status,
      });

      if (!result.success) { toast.error(result.error); return; }

      toast.success(status === "published" ? "Published!" : "Draft saved");
      if (isNew) router.push(`/admin/devotionals/${result.id}`);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      if (!devotional?.id) return;
      const result = await deleteDevotional(devotional.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Devotional deleted");
      router.push("/admin/devotionals");
    });
  }

  const isPublished = devotional?.status === "published";
  const missingImage = !imageUrl;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? "New devotional" : title || "Edit devotional"}
          </h1>
          {!isNew && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isPublished ? "default" : "secondary"}>
                {isPublished ? "Published" : "Draft"}
              </Badge>
              {isPublished && (
                <a
                  href={`${SITE_URL}/devotionals/${devotional.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  View on site <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isNew && isPublished && (
            <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleSave("draft")}>
              Unpublish
            </Button>
          )}
          <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleSave("draft")}>
            Save draft
          </Button>
          {!isPublished && (
            <Button size="sm" disabled={isPending || missingImage} onClick={() => handleSave("published")}>
              Publish
            </Button>
          )}
          {isPublished && (
            <Button size="sm" disabled={isPending} onClick={() => handleSave("published")}>
              Save
            </Button>
          )}
          {!isNew && (
            <>
              <Button
                variant="destructive"
                size="icon"
                disabled={isPending}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete devotional?</DialogTitle>
                  <DialogDescription>
                    This permanently deletes &ldquo;{devotional.title}&rdquo; and cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isPending}>Delete</Button>
                </DialogFooter>
              </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {missingImage && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <span>An image is required to publish this devotional. It also serves as the Open Graph (social share) image.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Devotional title" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Slug
              {!slugManual && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">(auto-generated)</span>
              )}
            </label>
            <Input value={slug} onChange={handleSlugChange} placeholder="url-slug" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Scripture reference</label>
            <Input value={scripture} onChange={(e) => setScripture(e.target.value)} placeholder="e.g. John 3:16" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary"
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Body</label>
            <RichEditor value={bodyHtml} onChange={setBodyHtml} placeholder="Write your devotional…" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <ImageUpload
              folder="devotionals"
              value={imageUrl}
              onChange={setImageUrl}
              label="Image"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}
