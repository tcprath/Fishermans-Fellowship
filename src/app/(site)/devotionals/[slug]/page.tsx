import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ChevronRight } from "lucide-react";
import {
  getDevotionalBySlug,
  getRelatedDevotionals,
  getTagsForDevotionals,
  getRecentDevotionals,
} from "@/lib/content";
import TagChips from "@/components/tag-chips";
import PostSidebar from "@/components/post-sidebar";
import RecentCarousel from "@/components/recent-carousel";

export const revalidate = 60;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const devotional = await getDevotionalBySlug(slug);
  if (!devotional) return {};
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/devotionals/${slug}`;
  return {
    title: devotional.title,
    description: devotional.excerpt ?? undefined,
    openGraph: {
      title: devotional.title,
      description: devotional.excerpt ?? undefined,
      images: [
        {
          url:
            devotional.image_url ??
            `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/devotional-default.jpg`,
          alt: devotional.title,
        },
      ],
      url,
    },
  };
}

export default async function DevotionalPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const devotional = await getDevotionalBySlug(slug);
  if (!devotional) notFound();

  const tagIds = (devotional.tags ?? []).map((t) => t.id);
  const [related, allTags, recent] = await Promise.all([
    getRelatedDevotionals(devotional.id, tagIds, 4),
    getTagsForDevotionals(),
    getRecentDevotionals(8),
  ]);
  const recentItems = recent
    .filter((d) => d.id !== devotional.id)
    .slice(0, 8)
    .map((d) => ({ kind: "devotional" as const, data: d }));

  const date = devotional.published_at
    ? format(new Date(devotional.published_at), "MMMM d, yyyy")
    : null;

  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/devotionals/${slug}`;

  return (
    <article>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative h-80 sm:h-[30rem] overflow-hidden bg-[var(--ff-blue)]">
        <Image
          src={devotional.image_url || "/devotional-default.jpg"}
          alt={devotional.title}
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
        <div className="absolute bottom-0 left-0 right-0 max-w-[var(--max-w-content,1140px)] mx-auto px-5 pb-14">
          {date && (
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
              {date}
            </p>
          )}
          {devotional.scripture && (
            <p className="font-serif italic text-[var(--gold-300,#D8C39C)] mb-3 text-base leading-relaxed">
              {devotional.scripture}
            </p>
          )}
          <h1
            className="font-display text-[var(--ff-cream)] max-w-2xl"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            {devotional.title}
          </h1>
        </div>
      </div>

      {/* ── Content + Sidebar grid ────────────────────────────────────────── */}
      <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-14">
        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-[var(--muted-text,#6E7882)] mb-10"
          >
            <Link
              href="/devotionals"
              className="hover:text-[var(--ff-blue)] transition-colors duration-200 font-medium"
            >
              Devotionals
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[var(--ink-soft,#3E4E5A)] truncate max-w-[240px]">
              {devotional.title}
            </span>
          </nav>

          {devotional.tags && devotional.tags.length > 0 && (
            <TagChips
              tags={devotional.tags}
              basePath="/devotionals"
              className="mb-8"
              size="md"
            />
          )}

          {devotional.body_html ? (
            <div
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-[var(--ink)] prose-headings:leading-tight prose-a:text-[var(--ff-blue)] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[var(--ff-gold)] prose-blockquote:not-italic prose-blockquote:font-display prose-blockquote:text-[var(--ink)] prose-img:rounded-[16px]"
              dangerouslySetInnerHTML={{ __html: devotional.body_html }}
            />
          ) : (
            <p className="text-[var(--muted-text,#6E7882)]">No content yet.</p>
          )}

          <div className="mt-16 pt-8 border-t border-[var(--line)]">
            <Link
              href="/devotionals"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ff-blue)] hover:text-[var(--blue-700,#33485A)] transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              Back to all devotionals
            </Link>
          </div>
        </div>

        <PostSidebar
          basePath="/devotionals"
          searchPlaceholder="Search devotionals"
          shareUrl={url}
          shareTitle={devotional.title}
          related={related.map((d) => ({ kind: "devotional" as const, data: d }))}
          tags={allTags}
        />
      </div>

      <RecentCarousel
        title="More daily words"
        eyebrow="Keep reading"
        viewAllHref="/devotionals"
        viewAllLabel="All devotionals"
        items={recentItems}
      />
    </article>
  );
}
