"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageUpload from "@/components/admin/image-upload";
import RichEditor from "@/components/admin/rich-editor";
import TagPicker from "@/components/admin/tag-picker";
import { upsertResource, deleteResource } from "@/app/(admin)/admin/resources/actions";
import { fetchUrlMetadata } from "@/app/(admin)/admin/resources/metadata-action";
import type { ResourceRow, ResourceType, TagRow } from "@/lib/supabase/types";
import { ExternalLink, Trash2, Star, Calendar, Sparkles, BookOpen } from "lucide-react";
import { format } from "date-fns";

// Field visibility per type
const TYPE_CONFIG: Record<
  ResourceType,
  {
    showUrl: boolean;
    showBody: boolean;
    showAuthor: boolean;
    authorLabel: string;
    authorPlaceholder: string;
    showScripture: boolean;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    urlLabel: string;
    urlPlaceholder: string;
    showImage: boolean;
    imageLabel: string;
  }
> = {
  post: {
    showUrl: false, showBody: true, showAuthor: true,
    authorLabel: "Author", authorPlaceholder: "Optional",
    showScripture: false,
    descriptionLabel: "Excerpt",
    descriptionPlaceholder: "Short summary shown on the resource list and detail intro",
    urlLabel: "URL", urlPlaceholder: "",
    showImage: true, imageLabel: "Hero image",
  },
  book: {
    showUrl: true, showBody: false, showAuthor: true,
    authorLabel: "Author", authorPlaceholder: "e.g. C.S. Lewis",
    showScripture: false,
    descriptionLabel: "Description",
    descriptionPlaceholder: "What's the book about?",
    urlLabel: "Buy / Read URL", urlPlaceholder: "https://www.publisher.com/book",
    showImage: true, imageLabel: "Cover image",
  },
  video: {
    showUrl: true, showBody: false, showAuthor: true,
    authorLabel: "Channel / Creator", authorPlaceholder: "e.g. BibleProject",
    showScripture: false,
    descriptionLabel: "Description",
    descriptionPlaceholder: "What's the video about?",
    urlLabel: "Video URL", urlPlaceholder: "https://www.youtube.com/watch?v=…",
    showImage: true, imageLabel: "Thumbnail",
  },
  podcast: {
    showUrl: true, showBody: false, showAuthor: true,
    authorLabel: "Show / Host", authorPlaceholder: "e.g. Ask Pastor John",
    showScripture: false,
    descriptionLabel: "Description",
    descriptionPlaceholder: "What's the episode about?",
    urlLabel: "Episode URL", urlPlaceholder: "https://podcasts.apple.com/…",
    showImage: true, imageLabel: "Artwork",
  },
  study: {
    showUrl: false, showBody: true, showAuthor: false,
    authorLabel: "", authorPlaceholder: "",
    showScripture: true,
    descriptionLabel: "Overview",
    descriptionPlaceholder: "A brief overview of the study and who it's for",
    urlLabel: "URL", urlPlaceholder: "",
    showImage: true, imageLabel: "Cover image",
  },
  article: {
    showUrl: true, showBody: false, showAuthor: true,
    authorLabel: "Author", authorPlaceholder: "e.g. John Piper",
    showScripture: false,
    descriptionLabel: "Description",
    descriptionPlaceholder: "What's the article about?",
    urlLabel: "Article URL", urlPlaceholder: "https://...",
    showImage: true, imageLabel: "Image",
  },
  link: {
    showUrl: true, showBody: false, showAuthor: false,
    authorLabel: "", authorPlaceholder: "",
    showScripture: false,
    descriptionLabel: "Description",
    descriptionPlaceholder: "What is this link?",
    urlLabel: "URL", urlPlaceholder: "https://...",
    showImage: true, imageLabel: "Image",
  },
};

const TYPE_OPTIONS: { value: ResourceType; label: string }[] = [
  { value: "post",    label: "Post (rich article)" },
  { value: "book",    label: "Book" },
  { value: "video",   label: "Video" },
  { value: "podcast", label: "Podcast" },
  { value: "study",   label: "Bible Study" },
  { value: "article", label: "Article" },
  { value: "link",    label: "Link" },
];

interface ResourceFormProps {
  resource?: ResourceRow;
  allTags: TagRow[];
  initialTagIds?: string[];
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default function ResourceForm({ resource, allTags, initialTagIds = [] }: ResourceFormProps) {
  const router = useRouter();
  const isNew = !resource;

  const [title, setTitle] = useState(resource?.title ?? "");
  const [slug, setSlug] = useState(resource?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!isNew);
  const [description, setDescription] = useState(resource?.description ?? "");
  const [type, setType] = useState<ResourceType>(resource?.type ?? "post");
  const [url, setUrl] = useState(resource?.url ?? "");
  const [bodyHtml, setBodyHtml] = useState(resource?.body_html ?? "");
  const [imageUrl, setImageUrl] = useState(resource?.image_url ?? "");
  const [author, setAuthor] = useState(resource?.author ?? "");
  const [featured, setFeatured] = useState(resource?.featured ?? false);
  const [publishAt, setPublishAt] = useState(
    resource?.publish_at ? format(new Date(resource.publish_at), "yyyy-MM-dd'T'HH:mm") : ""
  );
  const [scripture, setScripture] = useState(resource?.scripture ?? "");
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [autoFilling, setAutoFilling] = useState(false);
  const [autoFilledUrl, setAutoFilledUrl] = useState<string | null>(null);

  const cfg = TYPE_CONFIG[type];

  const isScheduledFuture = Boolean(publishAt && new Date(publishAt) > new Date());

  useEffect(() => {
    if (!slugManual) setSlug(toSlug(title));
  }, [title, slugManual]);

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManual(true);
    setSlug(e.target.value);
  }

  async function handleAutoFill(force = false) {
    const clean = url.trim();
    if (!clean || !/^https?:\/\//.test(clean)) return;
    if (!force && autoFilledUrl === clean) return;

    setAutoFilling(true);
    try {
      const result = await fetchUrlMetadata(clean);
      if (!result.success) {
        if (force) toast.error(result.error);
        return;
      }
      const meta = result.meta;
      let filled = 0;
      if (meta.title && (!title.trim() || force)) {
        setTitle(meta.title.slice(0, 200));
        filled++;
      }
      if (meta.description && (!description.trim() || force)) {
        setDescription(meta.description.slice(0, 500));
        filled++;
      }
      if (meta.image && (!imageUrl || force)) {
        setImageUrl(meta.image);
        filled++;
      }
      if (cfg.showAuthor) {
        const candidate = meta.author ?? meta.siteName;
        if (candidate && (!author.trim() || force)) {
          setAuthor(candidate);
          filled++;
        }
      }
      setAutoFilledUrl(clean);
      if (force) toast.success(filled > 0 ? `Filled ${filled} field${filled > 1 ? "s" : ""}` : "No new info found");
    } finally {
      setAutoFilling(false);
    }
  }

  async function handleSave(status: "draft" | "published") {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!slug.trim()) { toast.error("Slug is required"); return; }
    if (cfg.showUrl && !url.trim()) { toast.error("URL is required"); return; }

    startTransition(async () => {
      const result = await upsertResource({
        id: resource?.id,
        title,
        slug: slug.trim(),
        description: description || undefined,
        body_html: cfg.showBody ? bodyHtml || undefined : undefined,
        type,
        url: cfg.showUrl ? url.trim() : undefined,
        scripture: cfg.showScripture ? (scripture || undefined) : undefined,
        image_url: imageUrl || undefined,
        author: author || undefined,
        featured,
        status,
        publish_at: status === "published" && publishAt ? new Date(publishAt).toISOString() : null,
        tag_ids: tagIds,
      });

      if (!result.success) { toast.error(result.error); return; }

      toast.success(status === "published" ? "Published!" : "Draft saved");
      if (isNew) router.push(`/admin/resources/${result.id}`);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      if (!resource?.id) return;
      const result = await deleteResource(resource.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Resource deleted");
      router.push("/admin/resources");
    });
  }

  const isPublished = resource?.status === "published";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? "New resource" : title || "Edit resource"}
          </h1>
          {!isNew && (
            <div className="flex items-center gap-2 mt-1">
              {resource?.publish_at && new Date(resource.publish_at) > new Date() ? (
                <Badge variant="outline">Scheduled</Badge>
              ) : (
                <Badge variant={isPublished ? "default" : "secondary"}>
                  {isPublished ? "Published" : "Draft"}
                </Badge>
              )}
              {isPublished && (
                <a
                  href={`${SITE_URL}/resources`}
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
                    <DialogTitle>Delete resource?</DialogTitle>
                    <DialogDescription>
                      Permanently deletes &ldquo;{resource.title}&rdquo;. Cannot be undone.
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
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource title" required />
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

          {cfg.showUrl && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">{cfg.urlLabel}</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={autoFilling || !url.trim()}
                  onClick={() => handleAutoFill(true)}
                >
                  <Sparkles className="size-3.5" />
                  {autoFilling ? "Fetching…" : "Auto-fill from URL"}
                </Button>
              </div>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => handleAutoFill(false)}
                placeholder={cfg.urlPlaceholder}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste the link — we&apos;ll try to grab the title, image, and
                description automatically.
              </p>
            </div>
          )}

          {cfg.showScripture && (
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-muted-foreground" />
                Scripture reference
              </label>
              <Input
                value={scripture}
                onChange={(e) => setScripture(e.target.value)}
                placeholder="e.g. John 15:1–17 (KJV)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The primary passage this study walks through.
              </p>
            </div>
          )}

          {cfg.showAuthor && (
            <div>
              <label className="block text-sm font-medium mb-1.5">{cfg.authorLabel}</label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={cfg.authorPlaceholder}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">{cfg.descriptionLabel}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={cfg.descriptionPlaceholder}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
          </div>

          {cfg.showBody && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {type === "study" ? "Study content" : "Body"}
              </label>
              <RichEditor
                value={bodyHtml}
                onChange={setBodyHtml}
                placeholder={
                  type === "study"
                    ? "Build out the study — opening prayer, passage notes, discussion questions, application…"
                    : "Write the resource article…"
                }
                uploadFolder="resources"
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <Select value={type} onValueChange={(v) => v && setType(v as ResourceType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="mt-0.5 size-4 rounded border-input"
              />
              <div className="flex-1">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <Star className="size-3.5 text-muted-foreground" />
                  Featured
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Show in the Highlights row on the resources page.
                </p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
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
                <p className="text-xs text-muted-foreground mt-1">
                  {isScheduledFuture
                    ? `Publishes ${format(new Date(publishAt), "MMM d, yyyy 'at' h:mm a")}`
                    : "Date is in the past — will publish immediately"}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Leave empty to publish immediately</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <ImageUpload
              folder="resources"
              value={imageUrl}
              onChange={setImageUrl}
              label={`${cfg.imageLabel} (optional)`}
            />
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <TagPicker allTags={allTags} value={tagIds} onChange={setTagIds} />
          </div>
        </div>
      </div>
    </div>
  );
}
