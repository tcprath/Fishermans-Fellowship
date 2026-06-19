import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getResourceBySlug } from "@/lib/content";
import ShareButtons from "@/components/share-buttons";
import TagChips from "@/components/tag-chips";

export const revalidate = 60;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) return {};
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/resources/${slug}`;
  return {
    title: resource.title,
    description: resource.description ?? undefined,
    openGraph: {
      title: resource.title,
      description: resource.description ?? undefined,
      images: resource.image_url ? [{ url: resource.image_url, alt: resource.title }] : undefined,
      url,
    },
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) notFound();

  // External resources don't have detail pages — bounce to URL
  if (!["post", "study"].includes(resource.type) && resource.url) {
    redirect(resource.url);
  }

  const date = resource.published_at
    ? format(new Date(resource.published_at), "MMMM d, yyyy")
    : null;

  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/resources/${slug}`;

  return (
    <article>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      {resource.image_url ? (
        <div className="relative h-72 sm:h-[26rem] overflow-hidden bg-[var(--ff-blue)]">
          <Image
            src={resource.image_url}
            alt={resource.title}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(27,42,54,.25) 0%, rgba(27,42,54,.88) 100%)",
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 max-w-[var(--max-w-content,1140px)] mx-auto px-5 pb-12">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
              Resource{date ? ` · ${date}` : ""}
            </p>
            <h1
              className="font-display text-[var(--ff-cream)] max-w-3xl leading-tight"
              style={{ fontSize: "clamp(30px, 4.5vw, 50px)" }}
            >
              {resource.title}
            </h1>
            {resource.author && (
              <p className="text-[var(--blue-300,#9FAEBA)] mt-3 text-sm">
                By {resource.author}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[var(--ff-blue)] pt-24 pb-16">
          <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
              Resource{date ? ` · ${date}` : ""}
            </p>
            <h1
              className="font-display text-[var(--ff-cream)] max-w-3xl leading-tight"
              style={{ fontSize: "clamp(30px, 4.5vw, 50px)" }}
            >
              {resource.title}
            </h1>
            {resource.author && (
              <p className="text-[var(--blue-300,#9FAEBA)] mt-3 text-sm">
                By {resource.author}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-14">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-[var(--muted-text,#6E7882)]"
          >
            <Link
              href="/resources"
              className="hover:text-[var(--ff-blue)] transition-colors duration-200 font-medium"
            >
              Resources
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[var(--ink-soft,#3E4E5A)] truncate max-w-[260px]">
              {resource.title}
            </span>
          </nav>
          <ShareButtons url={url} title={resource.title} />
        </div>

        {resource.scripture && (
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--cream-200,#ECE2D4)] text-[var(--ff-blue)] text-sm font-semibold">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted-text,#6E7882)]">Scripture</span>
            <span className="font-serif italic">{resource.scripture}</span>
          </div>
        )}

        {resource.description && (
          <p className="font-serif italic text-[var(--muted-text,#6E7882)] text-lg mb-8 leading-relaxed border-l-2 border-[var(--ff-gold)] pl-5 max-w-3xl">
            {resource.description}
          </p>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <TagChips tags={resource.tags} basePath="/resources" className="mb-8" size="md" />
        )}

        {resource.body_html ? (
          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-[var(--ink)] prose-headings:leading-tight prose-a:text-[var(--ff-blue)] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[var(--ff-gold)] prose-blockquote:not-italic prose-blockquote:font-display prose-blockquote:text-[var(--ink)] prose-img:rounded-[16px]"
            dangerouslySetInnerHTML={{ __html: resource.body_html }}
          />
        ) : (
          <p className="text-[var(--muted-text,#6E7882)]">No content yet.</p>
        )}

        <div className="mt-16 pt-8 border-t border-[var(--line)]">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ff-blue)] hover:text-[var(--blue-700,#33485A)] transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to resources
          </Link>
        </div>
      </div>
    </article>
  );
}
