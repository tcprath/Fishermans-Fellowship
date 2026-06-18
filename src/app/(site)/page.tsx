import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Anchor, Users, BookOpen } from "lucide-react";
import DevotionalOfTheDay from "@/components/devotional-of-the-day";
import PostCard from "@/components/post-card";
import DevotionalCard from "@/components/devotional-card";
import SocialFeed from "@/components/social-feed";
import { Sparkle } from "@/components/ui/sparkle";
import { getRecentPostsAcrossBlogs, getRecentDevotionals, getAllBlogs } from "@/lib/content";

export const revalidate = 3600;

const PILLARS = [
  {
    icon: Anchor,
    title: "Fishers of Men",
    body: "Called to Matthew 4:19 — every tournament, retreat, and morning on the water is an opportunity to cast for the Kingdom.",
  },
  {
    icon: Users,
    title: "Fellowship & Brotherhood",
    body: "You weren't made to fight alone. We carry one another through a world at war and stand together for the Kingdom.",
  },
  {
    icon: BookOpen,
    title: "Grow & Be Equipped",
    body: "Daily time in the Word, discipleship, and mentorship — the tools to live faithfully wherever the season takes you.",
  },
];

export default async function HomePage() {
  const [recentPosts, recentDevotionals, blogs] = await Promise.all([
    getRecentPostsAcrossBlogs(4),
    getRecentDevotionals(3),
    getAllBlogs(),
  ]);

  const ffBlog = blogs.find((b) => b.slug === "fishermans-fellowship");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[105vh] flex items-center overflow-hidden">
        <Image
          src="/photos/fellowship-pic.jpg"
          alt="Fishermen on the water at sunset"
          fill
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(27,42,54,0.4) 0%, rgba(27,42,54,0.8) 60%, rgba(27,42,54,0.95) 85%, var(--ff-cream) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-(--max-w-content,1140px) mx-auto px-5 py-28 -mt-20">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-(--ff-gold) mb-4">
            <Sparkle size={10} className="text-(--ff-gold)" />
            Fisherman&apos;s Fellowship
          </p>
          <h1
            className="font-display text-(--ff-cream) mb-6 max-w-2xl"
            style={{ fontSize: "clamp(36px, 5vw, 66px)", textWrap: "balance" } as React.CSSProperties}
          >
            You weren&apos;t made to fish alone.
          </h1>
          <p
            className="text-(--blue-300,#9FAEBA) leading-relaxed max-w-lg mb-10"
            style={{ fontSize: "clamp(15px, 1.4vw, 17px)" }}
          >
            Fisherman&apos;s Fellowship brings Christian fishermen together to grow in
            faith, stand with one another, and share the love of Jesus — on the water
            and beyond.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/fishermans-fellowship" className="btn btn-gold">
              Join the Fellowship
              <span className="btn-chip">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/devotionals" className="btn btn-ghost-light">
              Start the Daily Devotional
            </Link>
          </div>
        </div>
      </section>

      {/* ── Devotional of the Day ─────────────────────────────────────────── */}
      <section className="bg-(--ff-cream) pt-4 pb-24">
        <div className="max-w-(--max-w-content,1140px) mx-auto px-5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-(--ff-gold) mb-3">
            <Sparkle size={10} className="text-(--ff-gold)" />
            Daily Word
          </p>
          <Suspense
            fallback={
              <div className="rounded-card bg-(--cream-200) h-72 animate-pulse" />
            }
          >
            <DevotionalOfTheDay />
          </Suspense>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section className="max-w-(--max-w-content,1140px) mx-auto px-5 py-24">
        <div className="max-w-2xl" data-reveal>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-(--ff-gold) mb-2">
            <Sparkle size={10} className="text-(--ff-gold)" />
            Our Mission
          </p>
          <h2
            className="font-display text-(--ink) leading-tight mb-5"
            style={{ fontSize: "clamp(28px, 4vw, 46px)" }}
          >
            The fishing is the on-ramp.<br /> Christ is the destination.
          </h2>
          <p className="text-(--ink-soft,#3E4E5A) text-lg leading-relaxed mb-6">
            We go where fishermen already are — tournaments, retreats, the daily grind —
            and offer real brotherhood and a real Savior. Evangelism. Discipleship.
            Mentorship. One mission.
          </p>
          <Link href="/about" className="btn btn-primary">
            Meet the ministry
            <span className="btn-chip">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        {/* Pillars */}
        <div className="grid sm:grid-cols-3 gap-5 mt-16">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="bg-white border border-(--line) rounded-card p-7 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-brand"
                data-reveal
                data-delay={String((i + 1) * 100)}
              >
                <div className="w-10 h-10 rounded-full bg-(--ff-blue) flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-(--ff-gold)" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-[19px] text-(--ink) mb-2">{p.title}</h3>
                <p className="text-sm text-(--ink-soft,#3E4E5A) leading-relaxed">{p.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Recent Posts ─────────────────────────────────────────────────── */}
      {(recentPosts.length > 0 || recentDevotionals.length > 0) && (
        <section className="max-w-(--max-w-content,1140px) mx-auto px-5 py-24">
          <div className="flex items-end justify-between mb-12" data-reveal>
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-(--ff-gold) mb-3">
                <Sparkle size={10} className="text-(--ff-gold)" />
                Latest
              </p>
              <h2
                className="font-display text-(--ink) leading-tight"
                style={{ fontSize: "clamp(28px, 4vw, 42px)" }}
              >
                From the Fellowship
              </h2>
            </div>
            <div className="flex gap-3 shrink-0">
              {ffBlog && (
                <Link href="/fishermans-fellowship" className="btn btn-ghost" style={{ padding: "9px 18px", fontSize: "13px" }}>
                  All posts
                </Link>
              )}
              <Link href="/devotionals" className="btn btn-ghost" style={{ padding: "9px 18px", fontSize: "13px" }}>
                All devotionals
              </Link>
            </div>
          </div>

          {recentPosts.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              {recentPosts.map((p, i) => (
                <div key={p.id} data-reveal data-delay={String(i * 100)}>
                  <PostCard post={p} blogSlug={p.blog_slug} />
                </div>
              ))}
            </div>
          )}

          {recentDevotionals.length > 0 && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-(--muted-text,#6E7882) mb-5">
                Recent Devotionals
              </p>
              <div className="grid sm:grid-cols-3 gap-5">
                {recentDevotionals.map((d, i) => (
                  <div key={d.id} data-reveal data-delay={String(i * 100)}>
                    <DevotionalCard devotional={d} />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* ── Social Feed ──────────────────────────────────────────────────── */}
      <div className="bg-(--paper)">
        <SocialFeed />
      </div>

    </>
  );
}
