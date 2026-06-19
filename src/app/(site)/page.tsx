import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Anchor, Users, BookOpen, Calendar, Heart, Compass, FileText } from "lucide-react";
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
              "linear-gradient(to bottom, rgba(27,42,54,0.4) 0%, rgba(27,42,54,0.85) 50%, #0A1219 78%, #0A1219 100%)",
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
      <section className="pt-2 pb-32 -mt-20 relative bg-[#0A1219]">
        <div className="max-w-(--max-w-content,1140px) mx-auto px-5">
          <Suspense
            fallback={
              <div className="rounded-card bg-[rgba(244,237,229,0.06)] h-44 animate-pulse" />
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

      {/* ── Explore (Bento) ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0A1219 0%, #0E1A24 50%, #0A1219 100%)" }}>
        {/* Top wave (cream → blue) — multi-layer ocean */}
        <div className="absolute inset-x-0 -top-px leading-[0] pointer-events-none z-10" aria-hidden>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="block w-full h-[70px] md:h-[110px]">
            <path
              d="M0,0 L0,55 C120,90 240,30 360,55 C480,80 600,40 720,60 C840,80 960,40 1080,60 C1200,80 1320,50 1440,65 L1440,0 Z"
              fill="var(--paper)"
              fillOpacity="0.55"
            />
            <path
              d="M0,0 L0,70 C160,100 320,50 480,75 C640,100 800,55 960,75 C1120,95 1280,65 1440,80 L1440,0 Z"
              fill="var(--paper)"
              fillOpacity="0.8"
            />
            <path
              d="M0,0 L0,85 C200,120 360,65 540,90 C720,115 900,75 1080,95 C1260,115 1380,90 1440,100 L1440,0 Z"
              fill="var(--paper)"
            />
          </svg>
        </div>

        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, var(--ff-gold) 0, transparent 40%), radial-gradient(circle at 80% 70%, var(--ff-gold) 0, transparent 35%)",
        }} />
        <div className="relative max-w-[var(--max-w-content,1140px)] mx-auto px-5 pt-40 pb-40 md:pt-52 md:pb-52">
          <div className="text-center mb-12" data-reveal>
            <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-3">
              <Sparkle size={10} className="text-[var(--ff-gold)]" />
              Explore the Ministry
            </p>
            <h2
              className="font-display text-[var(--ff-cream)] leading-tight"
              style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
            >
              Where the Fellowship lives.
            </h2>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {/* About — large tile (spans 2 cols + 2 rows) — navy blue overlay */}
            <Link
              href="/about"
              className="group relative overflow-hidden rounded-[24px] md:col-span-2 md:row-span-2 min-h-[360px] md:min-h-[520px] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] hover:shadow-[0_36px_70px_-20px_rgba(0,0,0,0.75)] transition-all duration-500 ease-[cubic-bezier(.32,.72,0,1)] hover:-translate-y-1"
              data-reveal
            >
              <Image
                src="/photos/fellowship-pic.jpg"
                alt="Fellowship on the water"
                fill
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(.32,.72,0,1)] group-hover:scale-[1.06]"
                sizes="(max-width:768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 transition-opacity duration-500" style={{
                background: "linear-gradient(to top, rgba(15,28,42,0.96) 0%, rgba(20,38,56,0.88) 40%, rgba(27,50,72,0.7) 75%, rgba(36,55,70,0.5) 100%)",
              }} />
              <div className="relative h-full p-8 md:p-10 flex flex-col justify-end z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Compass className="h-3.5 w-3.5 text-[var(--ff-gold)]" strokeWidth={2} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ff-gold)]">
                    About
                  </span>
                </div>
                <h3 className="font-display text-[var(--ff-cream)] mb-2 transition-transform duration-500 group-hover:-translate-y-0.5" style={{ fontSize: "clamp(22px, 2.4vw, 30px)", textWrap: "balance" } as React.CSSProperties}>
                  The heart of the ministry.
                </h3>
                <p className="text-sm md:text-[15px] text-[var(--blue-300,#9FAEBA)] max-w-md leading-relaxed">
                  Called to be fishers of men — evangelism, discipleship, mentorship, fellowship.
                </p>
                <span className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-[var(--ff-cream)]">
                  Meet the ministry
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </div>
            </Link>

            {/* Events */}
            <Link
              href="/events"
              className="group relative overflow-hidden rounded-[24px] min-h-[240px] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] hover:shadow-[0_28px_55px_-18px_rgba(0,0,0,0.7)] transition-all duration-500 ease-[cubic-bezier(.32,.72,0,1)] hover:-translate-y-1"
              data-reveal
              data-delay="100"
            >
              <Image
                src="/photos/hero-rise-up.jpg"
                alt="Sunset gathering"
                fill
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(.32,.72,0,1)] group-hover:scale-[1.06]"
                sizes="(max-width:768px) 100vw, 33vw"
              />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to top, rgba(18,42,52,0.94) 0%, rgba(28,68,82,0.78) 35%, rgba(45,108,128,0.5) 70%, rgba(70,145,165,0.28) 100%)",
              }} />
              <div className="relative h-full p-6 md:p-7 flex flex-col justify-end z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-3.5 w-3.5 text-[var(--ff-gold)]" strokeWidth={2} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ff-gold)]">
                    Events
                  </span>
                </div>
                <h3 className="font-display text-[var(--ff-cream)] leading-tight mb-1 whitespace-nowrap transition-transform duration-500 group-hover:-translate-y-0.5" style={{ fontSize: "clamp(18px, 1.6vw, 22px)" }}>
                  Upcoming events.
                </h3>
                <p className="text-sm text-[var(--ff-cream)]/85">
                  Tournaments, retreats, gatherings.
                </p>
              </div>
            </Link>

            {/* Blog */}
            <Link
              href="/fishermans-fellowship"
              className="group relative overflow-hidden rounded-[24px] min-h-[240px] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] hover:shadow-[0_28px_55px_-18px_rgba(0,0,0,0.7)] transition-all duration-500 ease-[cubic-bezier(.32,.72,0,1)] hover:-translate-y-1"
              data-reveal
              data-delay="200"
            >
              <Image
                src="/photos/hero-fisherman-blue.jpg"
                alt="Fisherman on the water"
                fill
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(.32,.72,0,1)] group-hover:scale-[1.06]"
                sizes="(max-width:768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,25,35,0.92)] via-[rgba(15,25,35,0.45)] to-[rgba(15,25,35,0.2)]" />
              <div className="relative h-full p-6 md:p-7 flex flex-col justify-end z-10">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-3.5 w-3.5 text-[var(--ff-gold)]" strokeWidth={2} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ff-gold)]">
                    Blog
                  </span>
                </div>
                <h3 className="font-display text-[var(--ff-cream)] leading-tight mb-1 whitespace-nowrap transition-transform duration-500 group-hover:-translate-y-0.5" style={{ fontSize: "clamp(18px, 1.6vw, 22px)" }}>
                  From the blog.
                </h3>
                <p className="text-sm text-[var(--blue-300,#9FAEBA)]">
                  Faith, brotherhood, the daily grind.
                </p>
              </div>
            </Link>

            {/* Rise Up God's Way — full width — GOLD overlay */}
            <Link
              href="/rise-up-gods-way"
              className="group relative overflow-hidden rounded-[24px] md:col-span-2 min-h-[260px] shadow-[0_22px_50px_-18px_rgba(80,55,15,0.55)] hover:shadow-[0_34px_65px_-18px_rgba(80,55,15,0.7)] transition-all duration-500 ease-[cubic-bezier(.32,.72,0,1)] hover:-translate-y-1"
              data-reveal
              data-delay="100"
            >
              <Image
                src="/photos/section-dock.jpg"
                alt="Brothers gathered at the dock"
                fill
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(.32,.72,0,1)] group-hover:scale-[1.06]"
                sizes="(max-width:768px) 100vw, 66vw"
              />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(135deg, rgba(58,42,18,0.62) 0%, rgba(110,82,42,0.45) 50%, rgba(74,52,24,0.68) 100%)",
              }} />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to top, rgba(40,28,12,0.7) 0%, rgba(40,28,12,0.25) 55%, transparent 100%)",
              }} />
              <div className="relative h-full p-6 md:p-9 flex flex-col justify-end z-10">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-3.5 w-3.5 text-[var(--ff-gold)]" strokeWidth={2} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ff-gold)]">
                    Sister Ministry
                  </span>
                </div>
                <h3 className="font-display text-[var(--ff-cream)] leading-tight mb-1.5 transition-transform duration-500 group-hover:-translate-y-0.5" style={{ fontSize: "clamp(20px, 2vw, 26px)" }}>
                  Rise Up God&apos;s Way.
                </h3>
                <p className="text-sm text-[var(--ff-cream)]/85 max-w-md leading-relaxed">
                  Biblical encouragement and personal discipleship for everyday faithfulness.
                </p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[var(--ff-gold)]">
                  Read Rise Up
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </div>
            </Link>

            {/* Donate — standout */}
            <Link
              href="/donate"
              className="group relative overflow-hidden rounded-[24px] min-h-[260px] flex shadow-[0_22px_50px_-18px_rgba(36,55,70,0.35)] hover:shadow-[0_34px_65px_-18px_rgba(36,55,70,0.5)] transition-all duration-500 ease-[cubic-bezier(.32,.72,0,1)] hover:-translate-y-1"
              data-reveal
              data-delay="200"
              style={{
                background: "linear-gradient(135deg, var(--paper) 0%, var(--cream-200) 60%, var(--cream-300) 100%)",
              }}
            >
              <span className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[var(--ff-gold)]/15 blur-2xl transition-transform duration-700 group-hover:scale-110" aria-hidden />
              <span className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-[var(--ff-blue)]/10 blur-3xl transition-transform duration-700 group-hover:scale-110" aria-hidden />
              <div className="relative p-6 md:p-7 flex flex-col justify-between w-full z-10">
                <div className="flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-[var(--ff-gold)]" fill="currentColor" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ff-gold)]">
                    Support the Mission
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-[var(--ff-blue)] leading-tight mb-1.5 transition-transform duration-500 group-hover:-translate-y-0.5" style={{ fontSize: "clamp(20px, 2vw, 26px)" }}>
                    Fuel the Fellowship.
                  </h3>
                  <p className="text-sm text-[var(--ink-soft,#3E4E5A)] mb-5 leading-relaxed">
                    Every gift sends another fisherman home with the Gospel.
                  </p>
                  <span className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[var(--ff-blue)] text-[var(--ff-cream)] text-base font-semibold shadow-md group-hover:shadow-lg group-hover:bg-[var(--blue-900,#1B2A36)] transition-all duration-300">
                    Donate
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom wave (blue → cream) — multi-layer ocean */}
        <div className="absolute inset-x-0 -bottom-px leading-[0] pointer-events-none z-10" aria-hidden>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="block w-full h-[70px] md:h-[110px]">
            {/* back wave */}
            <path
              d="M0,120 L0,65 C120,30 240,90 360,65 C480,40 600,80 720,60 C840,40 960,80 1080,60 C1200,40 1320,70 1440,55 L1440,120 Z"
              fill="var(--paper)"
              fillOpacity="0.55"
            />
            {/* mid wave */}
            <path
              d="M0,120 L0,50 C160,20 320,70 480,45 C640,20 800,65 960,45 C1120,25 1280,55 1440,40 L1440,120 Z"
              fill="var(--paper)"
              fillOpacity="0.8"
            />
            {/* front wave */}
            <path
              d="M0,120 L0,35 C200,0 360,55 540,30 C720,5 900,45 1080,25 C1260,5 1380,30 1440,20 L1440,120 Z"
              fill="var(--paper)"
            />
          </svg>
        </div>
      </section>

      {/* ── Recent Posts ─────────────────────────────────────────────────── */}
      {(recentPosts.length > 0 || recentDevotionals.length > 0) && (
        <section className="max-w-(--max-w-content,1140px) mx-auto px-5 pt-10 pb-6">
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

        </section>
      )}

      {recentDevotionals.length > 0 && (
        <section
          className="border-y border-[var(--line)] py-12"
          style={{
            background: "#F4EBD8",
            boxShadow:
              "inset 0 12px 18px -16px rgba(189,154,95,0.28), inset 0 -12px 18px -16px rgba(189,154,95,0.28)",
          }}
        >
          <div className="max-w-(--max-w-content,1140px) mx-auto px-5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-(--muted-text,#6E7882) mb-6">
              <Sparkle size={10} className="text-(--ff-gold)" />
              Recent Devotionals
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              {recentDevotionals.map((d, i) => (
                <div key={d.id} data-reveal data-delay={String(i * 100)}>
                  <DevotionalCard devotional={d} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Social Feed ──────────────────────────────────────────────────── */}
      <div className="bg-(--paper)">
        <SocialFeed />
      </div>

    </>
  );
}
