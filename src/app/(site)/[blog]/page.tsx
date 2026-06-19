import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Rss, ArrowRight, FileText } from "lucide-react";
import PostCard from "@/components/post-card";
import DevotionalCard from "@/components/devotional-card";
import { Sparkle } from "@/components/ui/sparkle";
import {
  getBlogBySlug,
  getPublishedPostsByBlog,
  getPublishedDevotionals,
  getTagsForPostsInBlog,
  getTagsForDevotionals,
} from "@/lib/content";
import TagFilterBar from "@/components/tag-filter-bar";

export const revalidate = 60;

type Params = { blog: string };
type SearchParams = { type?: string; tag?: string; q?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { blog: slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return {};
  return {
    title: blog.name,
    description: blog.description ?? undefined,
    alternates: { types: { "application/rss+xml": `/${slug}/rss.xml` } },
  };
}

export default async function BlogFeedPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { blog: slug } = await params;
  const { type = "all", tag, q } = await searchParams;

  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  const isFF = slug === "fishermans-fellowship";
  const isRU = slug === "rise-up-gods-way";

  const [posts, devotionals, postTagsForBlog, devTags] = await Promise.all([
    getPublishedPostsByBlog(blog.id, tag, q),
    isFF ? getPublishedDevotionals(tag, q) : Promise.resolve([]),
    getTagsForPostsInBlog(blog.id),
    isFF ? getTagsForDevotionals() : Promise.resolve([]),
  ]);

  const availableTags = (() => {
    const map = new Map<string, (typeof postTagsForBlog)[number]>();
    for (const t of postTagsForBlog) map.set(t.id, t);
    if (isFF) for (const t of devTags) map.set(t.id, t);
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  })();

  type FeedItem =
    | { kind: "post"; data: (typeof posts)[number] }
    | { kind: "devotional"; data: (typeof devotionals)[number] };

  let feed: FeedItem[] = [];
  if (isFF) {
    const merged: FeedItem[] = [
      ...posts.map((p) => ({ kind: "post" as const, data: p })),
      ...devotionals.map((d) => ({ kind: "devotional" as const, data: d })),
    ];
    merged.sort((a, b) => {
      const aDate = a.kind === "post" ? a.data.published_at : a.data.published_at;
      const bDate = b.kind === "post" ? b.data.published_at : b.data.published_at;
      return (bDate ?? "").localeCompare(aDate ?? "");
    });
    feed =
      type === "posts"
        ? merged.filter((i) => i.kind === "post")
        : type === "devotionals"
          ? merged.filter((i) => i.kind === "devotional")
          : merged;
  } else {
    feed = posts.map((p) => ({ kind: "post" as const, data: p }));
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-[var(--ff-cream)] pt-24 pb-20">
        <Image
          src={isRU ? "/photos/hero-rise-up.jpg" : "/photos/hero-fisherman-blue.jpg"}
          alt={isRU ? "Dramatic sunset with cross on a hill — a spiritual journey" : "Fisherman on the water at blue hour"}
          fill
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: isRU
              ? "linear-gradient(to bottom, rgba(80,20,140,0.52) 0%, rgba(40,8,80,0.80) 100%)"
              : "linear-gradient(to bottom, rgba(27,42,54,0.55) 0%, rgba(27,42,54,0.82) 100%)",
          }}
        />
        {/* Gold shimmer strip at top for Rise Up */}
        {isRU && (
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: "linear-gradient(to right, #b8860b, #f5c518, #b8860b)" }} />
        )}
        <div className="relative z-10 max-w-[var(--max-w-content,1140px)] mx-auto px-5">
          <div className={`flex items-center ${isRU ? "justify-between" : ""} gap-8`}>
            {/* Left — text */}
            <div className="flex-1 min-w-0">
              <p className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] mb-2 ${isRU ? "text-[#f5c518]" : "text-[var(--ff-gold)]"}`}>
                <Sparkle size={10} className={isRU ? "text-[#f5c518]" : "text-[var(--ff-gold)]"} />
                Ministry Blog
              </p>
              <h1
                className="font-display text-[var(--ff-cream)] mb-4 max-w-xl"
                style={{ fontSize: "clamp(34px, 5vw, 56px)" }}
              >
                {blog.name}
              </h1>
              {blog.description && (
                <p className={`text-lg leading-relaxed max-w-xl mb-6 ${isRU ? "text-[#e8d5f5]" : "text-[var(--blue-300,#9FAEBA)]"}`}>
                  {blog.description}
                </p>
              )}
              <a
                href={`/${slug}/rss.xml`}
                className={`inline-flex items-center gap-2 text-sm transition-colors duration-200 ${isRU ? "text-[#e8d5f5] hover:text-[#f5c518]" : "text-[var(--blue-300,#9FAEBA)] hover:text-[var(--ff-gold)]"}`}
              >
                <Rss className="h-3.5 w-3.5" /> RSS feed
              </a>
            </div>

            {/* Right — Rise Up logo */}
            {isRU && (
              <div className="shrink-0 hidden sm:block">
                <Image
                  src="/logos/rise-up-logo-v2.png"
                  alt="Rise Up God's Way logo"
                  width={320}
                  height={320}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className={`max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-14 ${isRU ? "rise-up-feed" : ""}`}>
        {/* Rise Up color-theme overrides — scoped, no global bleed */}
        {isRU && (
          <style>{`
            .rise-up-feed a:hover { color: #7c3aed; }
            .rise-up-feed .ru-icon-bg  { background-color: #5b21b6; }
            .rise-up-feed .ru-icon-fg  { color: #f5c518; }
            .rise-up-feed .ru-card-top { border-top: 3px solid #7c3aed; }
          `}</style>
        )}
        {/* Filter tabs (FF only) */}
        {isFF && (
          <div className="flex gap-1.5 mb-6 bg-[var(--cream-200)] rounded-full p-1.5 w-fit" data-reveal>
            {[
              { value: "all", label: "All" },
              { value: "posts", label: "Posts" },
              { value: "devotionals", label: "Devotionals" },
            ].map((tabOpt) => {
              const qs = new URLSearchParams();
              if (tabOpt.value !== "all") qs.set("type", tabOpt.value);
              if (tag) qs.set("tag", tag);
              const href = qs.toString() ? `/${slug}?${qs}` : `/${slug}`;
              const active = type === tabOpt.value || (tabOpt.value === "all" && type === "all");
              return (
                <Link
                  key={tabOpt.value}
                  href={href}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-white text-[var(--ff-blue)] shadow-sm"
                      : "text-[var(--ink-soft,#3E4E5A)] hover:text-[var(--ff-blue)]"
                  }`}
                >
                  {tabOpt.label}
                </Link>
              );
            })}
          </div>
        )}

        {availableTags.length > 0 && (
          <TagFilterBar
            tags={availableTags}
            activeSlug={tag}
            basePath={`/${slug}`}
            extraParams={isFF && type !== "all" ? { type } : undefined}
            className="mb-10"
          />
        )}

        {feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isRU ? "ru-icon-bg" : "bg-[var(--ff-blue)]"}`}>
              <FileText className={`h-7 w-7 ${isRU ? "ru-icon-fg" : "text-[var(--ff-gold)]"}`} strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl text-[var(--ink)] mb-3">
              No content yet
            </h2>
            <p className="text-[var(--ink-soft,#3E4E5A)] max-w-sm leading-relaxed">
              Content is on its way — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {feed.map((item, i) =>
              item.kind === "post" ? (
                <div key={`post-${item.data.id}`} data-reveal data-delay={String((i % 3) * 100)}>
                  <PostCard post={item.data} blogSlug={slug} />
                </div>
              ) : (
                <div key={`dev-${item.data.id}`} data-reveal data-delay={String((i % 3) * 100)}>
                  <DevotionalCard devotional={item.data} />
                </div>
              )
            )}
          </div>
        )}

      </div>
    </>
  );
}
