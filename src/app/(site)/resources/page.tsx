import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Library, Mail } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import ResourceCard from "@/components/resource-card";
import { getPublishedResources, getTagsForResources } from "@/lib/content";
import TagFilterBar from "@/components/tag-filter-bar";
import type { ResourceType } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Books, videos, podcasts, and studies — handpicked resources to help you walk with Christ and grow in the Word.",
};

export const revalidate = 60;

const TYPE_ORDER: ResourceType[] = [
  "post",
  "book",
  "video",
  "podcast",
  "study",
  "article",
  "link",
];

const TYPE_LABELS: Record<ResourceType, string> = {
  post: "Articles",
  book: "Books",
  video: "Videos",
  podcast: "Podcasts",
  study: "Bible Studies",
  article: "Articles",
  link: "Links",
};

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; tag?: string }>;
}) {
  const { type, tag } = await searchParams;
  const activeType =
    type && TYPE_ORDER.includes(type as ResourceType) ? (type as ResourceType) : null;

  const [all, filtered, tagsForResources] = await Promise.all([
    getPublishedResources({ tagSlug: tag }),
    getPublishedResources({ type: activeType ?? undefined, tagSlug: tag }),
    getTagsForResources(),
  ]);

  const featured = all.filter((r) => r.featured);

  const counts = TYPE_ORDER.reduce<Record<ResourceType, number>>((acc, t) => {
    acc[t] = all.filter((r) => r.type === t).length;
    return acc;
  }, {} as Record<ResourceType, number>);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-[var(--ff-cream)] pt-24 pb-20">
        <Image
          src="/photos/section-dock.jpg"
          alt="Brothers gathered at the dock"
          fill
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(27,42,54,0.55) 0%, rgba(27,42,54,0.82) 100%)",
          }}
        />
        <div className="relative z-10 max-w-[var(--max-w-content,1140px)] mx-auto px-5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
            <Sparkle size={10} className="text-[var(--ff-gold)]" />
            Equip Yourself
          </p>
          <h1
            className="font-display text-[var(--ff-cream)] max-w-2xl mb-4"
            style={{ fontSize: "clamp(34px, 5vw, 56px)" }}
          >
            Resources for the journey.
          </h1>
          <p className="text-[var(--blue-300,#9FAEBA)] text-lg leading-relaxed max-w-xl">
            Books, videos, podcasts, and studies — handpicked to help you walk
            with Christ on the water and at home.
          </p>
        </div>
      </section>

      {/* ── Featured ──────────────────────────────────────────────────────── */}
      {!activeType && !tag && featured.length > 0 && (
        <section className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 pt-16 pb-4">
          <div className="flex items-end justify-between mb-8" data-reveal>
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
                <Sparkle size={10} className="text-[var(--ff-gold)]" />
                Highlights
              </p>
              <h2
                className="font-display text-[var(--ink)] leading-tight"
                style={{ fontSize: "clamp(24px, 3.5vw, 36px)" }}
              >
                Where we&apos;d start.
              </h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {featured.map((r, i) => (
              <div key={r.id} data-reveal data-delay={String(i * 100)}>
                <ResourceCard resource={r} variant="featured" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Filters + Grid ────────────────────────────────────────────────── */}
      <section className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-16">
        <div className="mb-8">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
            <Library className="size-3.5" />
            All Resources
          </p>
          <h2
            className="font-display text-[var(--ink)] leading-tight"
            style={{ fontSize: "clamp(24px, 3.5vw, 36px)" }}
          >
            {activeType ? TYPE_LABELS[activeType] : "Browse the library."}
          </h2>
        </div>

        {/* Type filter chips */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <TypeChip
            href={tag ? `/resources?tag=${tag}` : "/resources"}
            active={!activeType}
            label="All"
            count={all.length}
          />
          {TYPE_ORDER.map((t) =>
            counts[t] > 0 ? (
              <TypeChip
                key={t}
                href={
                  tag
                    ? `/resources?type=${t}&tag=${tag}`
                    : `/resources?type=${t}`
                }
                active={activeType === t}
                label={TYPE_LABELS[t]}
                count={counts[t]}
              />
            ) : null
          )}
        </div>

        {/* Topic tag filter */}
        {tagsForResources.length > 0 && (
          <TagFilterBar
            tags={tagsForResources}
            activeSlug={tag}
            basePath="/resources"
            extraParams={activeType ? { type: activeType } : undefined}
            className="mb-10"
          />
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--ff-blue)] flex items-center justify-center mb-6">
              <BookOpen className="h-7 w-7 text-[var(--ff-gold)]" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-2xl text-[var(--ink)] mb-2">
              Nothing here yet
            </h3>
            <p className="text-[var(--ink-soft,#3E4E5A)] max-w-sm leading-relaxed">
              More resources coming soon.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r, i) => (
              <div key={r.id} data-reveal data-delay={String((i % 3) * 100)}>
                <ResourceCard resource={r} />
              </div>
            ))}
          </div>
        )}

        {/* Submit-a-resource nudge */}
        <div className="mt-16 rounded-[20px] bg-[var(--ff-blue)] text-[var(--ff-cream)] p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
              <Sparkle size={10} className="text-[var(--ff-gold)]" />
              Got a recommendation?
            </p>
            <h3
              className="font-display leading-tight text-[var(--ff-cream)] max-w-xl"
              style={{ fontSize: "clamp(20px, 2vw, 26px)", textWrap: "balance" } as React.CSSProperties}
            >
              Found a resource that helped you grow?
            </h3>
            <p
              className="text-sm text-[var(--blue-300,#9FAEBA)] mt-2 max-w-sm"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              Send it our way — we&apos;re always looking for books, studies, and
              voices worth sharing.
            </p>
          </div>
          <Link href="/contact" className="btn btn-gold shrink-0">
            <Mail className="h-4 w-4" />
            Send a recommendation
          </Link>
        </div>
      </section>
    </>
  );
}

function TypeChip({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.08em] border transition-colors ${
        active
          ? "bg-[var(--ff-blue)] text-[var(--ff-cream)] border-[var(--ff-blue)]"
          : "bg-white text-[var(--ink-soft,#3E4E5A)] border-[var(--line)] hover:border-[var(--ff-blue)] hover:text-[var(--ff-blue)]"
      }`}
    >
      {label}
      <span
        className={`text-[10px] font-bold tabular-nums ${
          active ? "text-[var(--ff-gold)]" : "text-[var(--muted-text,#6E7882)]"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}
