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
import BiblePicker from "@/components/admin/bible-picker";
import { upsertDevotional, deleteDevotional } from "@/app/(admin)/admin/devotionals/actions";
import type { DevotionalRow } from "@/lib/supabase/types";
import { ExternalLink, Trash2, BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";

interface DevotionalFormProps {
  devotional?: DevotionalRow;
  initialCalMonth?: number;
  initialCalDay?: number;
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default function DevotionalForm({ devotional, initialCalMonth, initialCalDay }: DevotionalFormProps) {
  const router = useRouter();
  const isNew = !devotional;

  const [title, setTitle] = useState(devotional?.title ?? "");
  const [slug, setSlug] = useState(devotional?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!isNew);
  const [scripture, setScripture] = useState(devotional?.scripture ?? "");
  const [excerpt, setExcerpt] = useState(devotional?.excerpt ?? "");
  const [bodyHtml, setBodyHtml] = useState(devotional?.body_html ?? "");
  const [imageUrl, setImageUrl] = useState(devotional?.image_url ?? "");
  const [calMonth, setCalMonth] = useState<number | "">(devotional?.cal_month ?? initialCalMonth ?? "");
  const [calDay, setCalDay] = useState<number | "">(devotional?.cal_day ?? initialCalDay ?? "");
  const [publishAt, setPublishAt] = useState(
    devotional?.publish_at ? format(new Date(devotional.publish_at), "yyyy-MM-dd'T'HH:mm") : ""
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [biblePickerOpen, setBiblePickerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isScheduledFuture = Boolean(publishAt && new Date(publishAt) > new Date());

  useEffect(() => {
    if (!slugManual) setSlug(toSlug(title));
  }, [title, slugManual]);

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManual(true);
    setSlug(e.target.value);
  }

  function validateCalDate(): boolean {
    if (calMonth === "" && calDay === "") return true;
    if (calMonth === "" || calDay === "") {
      toast.error("Set both month and day, or leave both empty");
      return false;
    }
    const maxDay = DAYS_IN_MONTH[Number(calMonth) - 1];
    if (Number(calDay) < 1 || Number(calDay) > maxDay) {
      toast.error(`${MONTHS[Number(calMonth) - 1]} only has ${maxDay} days`);
      return false;
    }
    return true;
  }

  async function handleSave(status: "draft" | "published") {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!slug.trim()) { toast.error("Slug is required"); return; }
    if (!validateCalDate()) return;

    startTransition(async () => {
      const result = await upsertDevotional({
        id: devotional?.id,
        title,
        slug: slug.trim(),
        scripture: scripture || undefined,
        excerpt: excerpt || undefined,
        body_html: bodyHtml || undefined,
        image_url: imageUrl || undefined,
        cal_month: calMonth !== "" ? Number(calMonth) : null,
        cal_day: calDay !== "" ? Number(calDay) : null,
        status,
        publish_at: status === "published" && publishAt ? new Date(publishAt).toISOString() : null,
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
  const maxDay = calMonth !== "" ? DAYS_IN_MONTH[Number(calMonth) - 1] : 31;

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
              {devotional?.publish_at && new Date(devotional.publish_at) > new Date() ? (
                <Badge variant="outline">Scheduled</Badge>
              ) : (
                <Badge variant={isPublished ? "default" : "secondary"}>
                  {isPublished ? "Published" : "Draft"}
                </Badge>
              )}
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
            <Button size="sm" disabled={isPending} onClick={() => handleSave("published")}>
              {isScheduledFuture ? <><Calendar className="size-3.5" />Schedule</> : "Publish"}
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
            <div className="flex gap-2">
              <Input
                value={scripture}
                onChange={(e) => setScripture(e.target.value)}
                placeholder="e.g. John 3:16 (KJV)"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBiblePickerOpen(true)}
              >
                <BookOpen className="size-3.5" />
                Browse
              </Button>
            </div>
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
              label="Image (optional)"
            />
          </div>

          {/* Calendar date */}
          <div className="bg-white rounded-xl border border-border p-5 space-y-3">
            <label className="block text-sm font-medium flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              Calendar date
            </label>
            <p className="text-xs text-muted-foreground">Shows on this date each year.</p>
            <div className="flex gap-2">
              <select
                value={calMonth}
                onChange={(e) => {
                  setCalMonth(e.target.value === "" ? "" : Number(e.target.value));
                  setCalDay("");
                }}
                className="flex-1 h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={maxDay}
                value={calDay}
                onChange={(e) => setCalDay(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Day"
                className="w-20 h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            {calMonth !== "" && calDay !== "" && (
              <p className="text-xs text-muted-foreground">
                Assigned to {MONTHS[Number(calMonth) - 1]} {calDay}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-border p-5 space-y-1.5">
            <label className="block text-sm font-medium flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              Schedule publish
            </label>
            <input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            {publishAt ? (
              <p className="text-xs text-muted-foreground">
                {isScheduledFuture
                  ? `Publishes ${format(new Date(publishAt), "MMM d, yyyy 'at' h:mm a")}`
                  : "Date is in the past — will publish immediately"}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Leave empty to publish immediately</p>
            )}
          </div>
        </div>
      </div>

      <BiblePicker
        open={biblePickerOpen}
        onOpenChange={setBiblePickerOpen}
        onSelect={(ref, text) => {
          setScripture(ref);
          if (text) setExcerpt(text);
        }}
      />
    </div>
  );
}
