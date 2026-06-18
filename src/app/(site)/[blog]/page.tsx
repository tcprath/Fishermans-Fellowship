import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Rss } from "lucide-react";
import PostCard from "@/components/post-card";
import DevotionalCard from "@/components/devotional-card";
import SubscribeForm from "@/components/subscribe-form";
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

  // Build merged + sorted feed for FF
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
      {/* Header */}
      <section className="bg-[var(--ff-blue)] text-[var(--ff-cream)] pt-20 pb-16">
        <div className="max-w-content mx-auto px-5">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-4">
            ✦ Ministry Blog
          </p>
          <h1
            className="font-display leading-tight mb-4"
            style={{ fontSize: "clamp(34px, 5vw, 52px)" }}
          >
            {blog.name}
          </h1>
          {blog.description && (
            <p className="text-[var(--blue-300)] text-lg leading-relaxed max-w-xl mb-6">
              {blog.description}
            </p>
          )}
          <a
            href={`/${slug}/rss.xml`}
            className="inline-flex items-center gap-2 text-sm text-[var(--blue-300)] hover:text-[var(--ff-gold)] transition-colors"
          >
            <Rss className="h-4 w-4" /> RSS feed
          </a>
        </div>
      </section>

      <div className="max-w-content mx-auto px-5 py-12">
        {/* Filter tabs (FF only) */}
        {isFF && (
          <div className="flex gap-2 mb-10 bg-[var(--cream-200)] rounded-full p-1.5 w-fit">
            {[
              { value: "all", label: "All" },
              { value: "posts", label: "Posts" },
              { value: "devotionals", label: "Devotionals" },
            ].map((tab) => (
              <Link
                key={tab.value}
                href={tab.value === "all" ? `/${slug}` : `/${slug}?type=${tab.value}`}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  type === tab.value || (tab.value === "all" && type === "all")
                    ? "bg-white text-[var(--ff-blue)] shadow-sm"
                    : "text-[var(--ink-soft)] hover:text-[var(--ff-blue)]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        )}

        {feed.length === 0 ? (
          <p className="text-[var(--muted)] text-center py-24">
            No content published yet — check back soon.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed.map((item) =>
              item.kind === "post" ? (
                <PostCard key={`post-${item.data.id}`} post={item.data} blogSlug={slug} />
              ) : (
                <DevotionalCard key={`dev-${item.data.id}`} devotional={item.data} />
              )
            )}
          </div>
        )}

        {/* Subscribe band */}
        <div className="mt-20 bg-[var(--ff-cream)] rounded-card p-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-3">
              ✦ Stay connected
            </p>
            <h2 className="font-display text-2xl text-[var(--ff-blue)] mb-2">
              Get the Daily Devotional
            </h2>
            <p className="text-sm text-[var(--ink-soft)]">
              A free word each morning to keep you in Scripture — right where you are.
            </p>
          </div>
          <SubscribeForm />
        </div>
      </div>
    </>
  );
}
