import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
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
      {/* Hero image */}
      {post.hero_image_url && (
        <div className="relative h-72 sm:h-96 overflow-hidden">
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
                "linear-gradient(180deg, rgba(27,42,54,.3) 0%, rgba(27,42,54,.7) 100%)",
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8">
          <Link href={`/${blogSlug}`} className="hover:text-[var(--ff-blue)] transition-colors">
            {blog.name}
          </Link>
          <span>/</span>
          <span className="text-[var(--ink-soft)]">{post.title}</span>
        </nav>

        {/* Meta */}
        <div className="mb-8">
          {date && (
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--muted)] mb-3">
              {date}{post.author ? ` · By ${post.author}` : ""}
            </p>
          )}
          <h1
            className="font-display text-[var(--ink)] leading-tight"
            style={{ fontSize: "clamp(30px, 4.5vw, 48px)" }}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="font-serif italic text-[var(--muted)] text-lg mt-4 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Body */}
        {post.body_html ? (
          <div
            className="prose prose-lg prose-headings:font-display prose-headings:text-[var(--ink)] prose-a:text-[var(--ff-blue)] prose-blockquote:border-l-[var(--ff-gold)] max-w-none"
            dangerouslySetInnerHTML={{ __html: post.body_html }}
          />
        ) : (
          <p className="text-[var(--muted)]">No content yet.</p>
        )}
      </div>
    </article>
  );
}
