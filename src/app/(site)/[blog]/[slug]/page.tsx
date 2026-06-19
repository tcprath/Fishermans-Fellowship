import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ChevronRight } from "lucide-react";
import {
  getBlogBySlug,
  getPostBySlug,
  getRelatedPosts,
  getTagsForPostsInBlog,
  getPublishedPostsByBlog,
} from "@/lib/content";
import TagChips from "@/components/tag-chips";
import PostSidebar from "@/components/post-sidebar";
import RecentCarousel from "@/components/recent-carousel";

export const revalidate = 60;

type Params = { blog: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { blog: blogSlug, slug } = await params;
  const blog = await getBlogBySlug(blogSlug);
  if (!blog) return {};
  const post = await getPostBySlug(blog.id, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.hero_image_url ? [post.hero_image_url] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { blog: blogSlug, slug } = await params;

  const blog = await getBlogBySlug(blogSlug);
  if (!blog) notFound();

  const post = await getPostBySlug(blog.id, slug);
  if (!post) notFound();

  const tagIds = (post.tags ?? []).map((t) => t.id);
  const [related, allTags, recent] = await Promise.all([
    getRelatedPosts(blog.id, post.id, tagIds, 4),
    getTagsForPostsInBlog(blog.id),
    getPublishedPostsByBlog(blog.id),
  ]);
  const recentItems = recent
    .filter((p) => p.id !== post.id)
    .slice(0, 8)
    .map((p) => ({ kind: "post" as const, data: p, blogSlug }));

  const date = post.published_at
    ? format(new Date(post.published_at), "MMMM d, yyyy")
    : null;

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${blogSlug}/${slug}`;

  return (
    <article>
      {/* ── Hero image ────────────────────────────────────────────────────── */}
      {post.hero_image_url && (
        <div className="relative h-72 sm:h-[420px] overflow-hidden">
          <Image
            src={post.hero_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(27,42,54,.2) 0%, rgba(27,42,54,.65) 100%)",
            }}
          />
        </div>
      )}

      {/* ── Content + Sidebar grid ────────────────────────────────────────── */}
      <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-14">
        <div className="min-w-0">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-[var(--muted-text,#6E7882)] mb-10"
          >
            <Link
              href={`/${blogSlug}`}
              className="hover:text-[var(--ff-blue)] transition-colors duration-200 font-medium"
            >
              {blog.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[var(--ink-soft,#3E4E5A)] truncate max-w-[240px]">
              {post.title}
            </span>
          </nav>

          {/* Meta */}
          <div className="mb-10">
            {date && (
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted-text,#6E7882)] mb-4">
                {date}
                {post.author ? ` · By ${post.author}` : ""}
              </p>
            )}
            <h1
              className="font-display text-[var(--ink)] leading-tight"
              style={{ fontSize: "clamp(30px, 4.5vw, 50px)" }}
            >
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="font-serif italic text-[var(--muted-text,#6E7882)] text-lg mt-5 leading-relaxed border-l-2 border-[var(--ff-gold)] pl-5">
                {post.excerpt}
              </p>
            )}
            {post.tags && post.tags.length > 0 && (
              <TagChips
                tags={post.tags}
                basePath={`/${blogSlug}`}
                className="mt-6"
                size="md"
              />
            )}
          </div>

          {/* Body */}
          {post.body_html ? (
            <div
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-[var(--ink)] prose-headings:leading-tight prose-a:text-[var(--ff-blue)] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[var(--ff-gold)] prose-blockquote:not-italic prose-blockquote:font-display prose-blockquote:text-[var(--ink)] prose-img:rounded-[16px]"
              dangerouslySetInnerHTML={{ __html: post.body_html }}
            />
          ) : (
            <p className="text-[var(--muted-text,#6E7882)]">No content yet.</p>
          )}

          {/* Back */}
          <div className="mt-16 pt-8 border-t border-[var(--line)]">
            <Link
              href={`/${blogSlug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ff-blue)] hover:text-[var(--blue-700,#33485A)] transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              Back to {blog.name}
            </Link>
          </div>
        </div>

        <PostSidebar
          basePath={`/${blogSlug}`}
          searchPlaceholder={`Search ${blog.name}`}
          shareUrl={shareUrl}
          shareTitle={post.title}
          related={related.map((p) => ({ kind: "post" as const, data: p, blogSlug }))}
          tags={allTags}
        />
      </div>

      <RecentCarousel
        title={`More from ${blog.name}`}
        eyebrow="Keep reading"
        viewAllHref={`/${blogSlug}`}
        viewAllLabel={`All ${blog.name} posts`}
        items={recentItems}
      />
    </article>
  );
}
