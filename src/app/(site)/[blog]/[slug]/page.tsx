import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getBlogBySlug, getPostBySlug } from "@/lib/content";

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

  const date = post.published_at
    ? format(new Date(post.published_at), "MMMM d, yyyy")
    : null;

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

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-5 py-16">
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
    </article>
  );
}
