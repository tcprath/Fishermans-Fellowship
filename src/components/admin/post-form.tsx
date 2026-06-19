"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import RichEditor from "@/components/admin/rich-editor";
import ImageUpload from "@/components/admin/image-upload";
import { upsertPost, deletePost } from "@/app/(admin)/admin/posts/actions";
import type { PostRow, BlogRow } from "@/lib/supabase/types";
import { ExternalLink, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface PostFormProps {
  blogs: BlogRow[];
  post?: PostRow & { blog?: BlogRow };
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

const BLOG_DEFAULT_AUTHORS: Record<string, string> = {
  "fishermans-fellowship": "Cody Prather",
  "rise-up-gods-way": "Sara Prather",
};

function defaultAuthorForBlog(blogs: BlogRow[], blogId: string): string {
  const slug = blogs.find((b) => b.id === blogId)?.slug ?? "";
  return BLOG_DEFAULT_AUTHORS[slug] ?? "";
}

export default function PostForm({ blogs, post }: PostFormProps) {
  const router = useRouter();
  const isNew = !post;

  const defaultBlogId = post?.blog_id
    ?? blogs.find((b) => b.slug === "fishermans-fellowship")?.id
    ?? blogs[0]?.id
    ?? "";
  const [blogId, setBlogId] = useState(defaultBlogId);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!isNew);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(post?.hero_image_url ?? "");
  const [author, setAuthor] = useState(
    post?.author ?? defaultAuthorForBlog(blogs, defaultBlogId)
  );
  const [bodyHtml, setBodyHtml] = useState(post?.body_html ?? "");
  const [publishAt, setPublishAt] = useState(
    post?.publish_at ? format(new Date(post.publish_at), "yyyy-MM-dd'T'HH:mm") : ""
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isScheduledFuture = Boolean(publishAt && new Date(publishAt) > new Date());

  // Auto-generate slug from title when not manually set
  useEffect(() => {
    if (!slugManual) setSlug(toSlug(title));
  }, [title, slugManual]);

  const selectedBlog = blogs.find((b) => b.id === blogId);

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugManual(true);
    setSlug(e.target.value);
  }

  async function handleSave(status: "draft" | "published") {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!slug.trim()) { toast.error("Slug is required"); return; }
    if (!blogId) { toast.error("Blog is required"); return; }

    startTransition(async () => {
      const result = await upsertPost({
        id: post?.id,
        blog_id: blogId,
        blog_slug: selectedBlog?.slug,
        title,
        slug: slug.trim(),
        excerpt: excerpt || undefined,
        body_html: bodyHtml || undefined,
        hero_image_url: heroImageUrl || undefined,
        author: author || undefined,
        status,
        publish_at: status === "published" && publishAt ? new Date(publishAt).toISOString() : null,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(status === "published" ? "Published!" : "Draft saved");
      if (isNew) router.push(`/admin/posts/${result.id}`);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      if (!post?.id) return;
      const result = await deletePost(post.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Post deleted");
      router.push("/admin/posts");
    });
  }

  const isPublished = post?.status === "published";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? "New post" : title || "Edit post"}
          </h1>
          {!isNew && (
            <div className="flex items-center gap-2 mt-1">
              {post?.publish_at && new Date(post.publish_at) > new Date() ? (
                <Badge variant="outline">Scheduled</Badge>
              ) : (
                <Badge variant={isPublished ? "default" : "secondary"}>
                  {isPublished ? "Published" : "Draft"}
                </Badge>
              )}
              {isPublished && selectedBlog && (
                <a
                  href={`${SITE_URL}/${selectedBlog.slug}/${post.slug}`}
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

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {!isNew && isPublished && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleSave("draft")}
            >
              Unpublish
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => handleSave("draft")}
          >
            Save draft
          </Button>
          {!isPublished && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => handleSave("published")}
            >
              {isScheduledFuture ? <><Calendar className="size-3.5" />Schedule</> : "Publish"}
            </Button>
          )}
          {isPublished && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => handleSave("published")}
            >
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
                  <DialogTitle>Delete post?</DialogTitle>
                  <DialogDescription>
                    This permanently deletes &ldquo;{post.title}&rdquo; and cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Slug
              {!slugManual && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  (auto-generated)
                </span>
              )}
            </label>
            <Input
              value={slug}
              onChange={handleSlugChange}
              placeholder="url-slug"
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary (used in feeds and meta descriptions)"
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Body</label>
            <RichEditor value={bodyHtml} onChange={setBodyHtml} placeholder="Write your post…" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Blog</label>
              <Select value={blogId} onValueChange={(v) => {
                if (!v) return;
                setBlogId(v);
                // Auto-swap author when it's still a default (not user-edited)
                const isDefault = Object.values(BLOG_DEFAULT_AUTHORS).includes(author) || author === "";
                if (isDefault) setAuthor(defaultAuthorForBlog(blogs, v));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blog">
                    {selectedBlog?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {blogs.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Author</label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
              />
            </div>

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
              {publishAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  {isScheduledFuture
                    ? `Publishes ${format(new Date(publishAt), "MMM d, yyyy 'at' h:mm a")}`
                    : "Date is in the past — will publish immediately"}
                </p>
              )}
              {!publishAt && (
                <p className="text-xs text-muted-foreground mt-1">Leave empty to publish immediately</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <ImageUpload
              folder="posts"
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              label="Hero image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
