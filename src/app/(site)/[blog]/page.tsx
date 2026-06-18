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
} from "@/lib/content";

export const revalidate = 60;

type Params = { blog: string };
type SearchParams = { type?: string };

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
  const { type = "all" } = await searchParams;

  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  const isFF = slug === "fishermans-fellowship";

  const [posts, devotionals] = await Promise.all([
    getPublishedPostsByBlog(blog.id),
    isFF ? getPublishedDevotionals() : Promise.resolve([]),
  ]);

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
          src="/photos/hero-fisherman-blue.jpg"
          alt="Fisherman on the water at blue hour"
          fill
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(27,42,54,0.55) 0%, rgba(27,42,54,0.82) 100%)" }}
        />
        <div className="relative z-10 max-w-[var(--max-w-content,1140px)] mx-auto px-5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
            <Sparkle size={10} className="text-[var(--ff-gold)]" />
            Ministry Blog
          </p>
          <h1
            className="font-display text-[var(--ff-cream)] mb-4 max-w-xl"
            style={{ fontSize: "clamp(34px, 5vw, 56px)" }}
          >
            {blog.name}
          </h1>
          {blog.description && (
            <p className="text-[var(--blue-300,#9FAEBA)] text-lg leading-relaxed max-w-xl mb-6">
              {blog.description}
            </p>
          )}
          <a
            href={`/${slug}/rss.xml`}
            className="inline-flex items-center gap-2 text-sm text-[var(--blue-300,#9FAEBA)] hover:text-[var(--ff-gold)] transition-colors duration-200"
          >
            <Rss className="h-3.5 w-3.5" /> RSS feed
          </a>
        </div>
      </section>

      <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-14">
        {/* Filter tabs (FF only) */}
        {isFF && (
          <div className="flex gap-1.5 mb-12 bg-[var(--cream-200)] rounded-full p-1.5 w-fit" data-reveal>
            {[
              { value: "all", label: "All" },
              { value: "posts", label: "Posts" },
              { value: "devotionals", label: "Devotionals" },
            ].map((tab) => (
              <Link
                key={tab.value}
                href={tab.value === "all" ? `/${slug}` : `/${slug}?type=${tab.value}`}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  type === tab.value || (tab.value === "all" && type === "all")
                    ? "bg-white text-[var(--ff-blue)] shadow-sm"
                    : "text-[var(--ink-soft,#3E4E5A)] hover:text-[var(--ff-blue)]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        )}

        {feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--ff-blue)] flex items-center justify-center mb-6">
              <FileText className="h-7 w-7 text-[var(--ff-gold)]" strokeWidth={1.5} />
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
