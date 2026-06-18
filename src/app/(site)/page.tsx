import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import DevotionalOfTheDay from "@/components/devotional-of-the-day";
import PostCard from "@/components/post-card";
import DevotionalCard from "@/components/devotional-card";
import SubscribeForm from "@/components/subscribe-form";
import { getRecentPostsAcrossBlogs, getRecentDevotionals, getAllBlogs } from "@/lib/content";

export const revalidate = 3600;

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
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <Image
          src="/photos/hero-fisherman-blue.jpg"
          alt="Fisherman at blue hour on the water"
          fill
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(27,42,54,.72) 0%, rgba(27,42,54,.88) 100%)",
          }}
        />
        <div className="relative z-10 max-w-content mx-auto px-5 py-24">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-6">
            ✦ Fisherman&apos;s Fellowship
          </p>
          <h1
            className="font-display text-[var(--ff-cream)] leading-[1.05] mb-6"
            style={{ fontSize: "clamp(40px, 7vw, 80px)" }}
          >
            You weren&apos;t made<br className="hidden sm:block" /> to fish alone.
          </h1>
          <p className="text-[var(--blue-300)] text-lg leading-relaxed max-w-xl mb-10">
            Fisherman&apos;s Fellowship brings Christian fishermen together to grow in
            faith, stand with one another, and share the love of Jesus — on the water
            and beyond.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/fishermans-fellowship"
              className="inline-flex items-center gap-2 bg-[var(--ff-gold)] text-[var(--ff-blue)] hover:bg-[var(--gold-700)] transition-colors rounded-full px-7 py-3.5 font-semibold"
            >
              Join the Fellowship
            </Link>
            <Link
              href="/devotionals"
              className="inline-flex items-center gap-2 border border-[rgba(244,237,229,.4)] text-[var(--ff-cream)] hover:bg-[rgba(244,237,229,.08)] transition-colors rounded-full px-7 py-3.5 font-semibold"
            >
              Start the Daily Devotional
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section className="max-w-content mx-auto px-5 py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-4">
            ✦ Our Mission
          </p>
          <h2
            className="font-display text-[var(--ink)] leading-tight mb-6"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            The fishing is the on-ramp.<br /> Christ is the destination.
          </h2>
          <p className="text-[var(--ink-soft)] text-lg leading-relaxed mb-4">
            We go where fishermen already are — tournaments, retreats, the daily grind —
            and offer real brotherhood and a real Savior. Evangelism. Discipleship.
            Mentorship. One mission.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-[var(--ff-blue)] font-semibold text-sm border-b border-[var(--ff-blue)] pb-0.5 hover:text-[var(--blue-700)] hover:border-[var(--blue-700)] transition-colors"
          >
            Meet the ministry
          </Link>
        </div>

        {/* Pillars */}
        <div className="grid sm:grid-cols-3 gap-6 mt-16">
          {[
            {
              icon: "⚓",
              title: "Fishers of Men",
              body: "Called to Matthew 4:19 — every tournament, retreat, and morning on the water is an opportunity to cast for the Kingdom.",
            },
            {
              icon: "🤝",
              title: "Fellowship & Brotherhood",
              body: "You weren't made to fight alone. We carry one another through a world at war and stand together for the Kingdom.",
            },
            {
              icon: "📖",
              title: "Grow & Be Equipped",
              body: "Daily time in the Word, discipleship, and mentorship — the tools to live faithfully wherever the season takes you.",
            },
          ].map((p) => (
            <div
              key={p.title}
              className="bg-white border border-[var(--line)] rounded-card p-7"
            >
              <span className="text-3xl mb-4 block">{p.icon}</span>
              <h3 className="font-display text-xl text-[var(--ink)] mb-2">{p.title}</h3>
              <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Devotional of the Day ─────────────────────────────────────────── */}
      <section className="bg-[var(--ff-cream)] py-24">
        <div className="max-w-content mx-auto px-5">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-4">
            ✦ Daily Word
          </p>
          <Suspense
            fallback={
              <div className="rounded-card bg-[var(--cream-200)] h-64 animate-pulse" />
            }
          >
            <DevotionalOfTheDay />
          </Suspense>
        </div>
      </section>

      {/* ── Recent Posts ─────────────────────────────────────────────────── */}
      {(recentPosts.length > 0 || recentDevotionals.length > 0) && (
        <section className="max-w-content mx-auto px-5 py-24">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-3">
            ✦ Latest
          </p>
          <h2
            className="font-display text-[var(--ink)] leading-tight mb-12"
            style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
          >
            From the Fellowship
          </h2>

          {recentPosts.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {recentPosts.map((p) => (
                <PostCard key={p.id} post={p} blogSlug={p.blog_slug} />
              ))}
            </div>
          )}

          {recentDevotionals.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--muted)] mb-6">
                Recent Devotionals
              </p>
              <div className="grid sm:grid-cols-3 gap-6">
                {recentDevotionals.map((d) => (
                  <DevotionalCard key={d.id} devotional={d} />
                ))}
              </div>
            </>
          )}

          <div className="flex gap-4 mt-12">
            {ffBlog && (
              <Link
                href="/fishermans-fellowship"
                className="px-6 py-3 rounded-full border border-[var(--line)] text-[var(--ff-blue)] font-semibold text-sm hover:border-[var(--ff-blue)] hover:bg-[rgba(36,55,70,.04)] transition-colors"
              >
                All posts
              </Link>
            )}
            <Link
              href="/devotionals"
              className="px-6 py-3 rounded-full border border-[var(--line)] text-[var(--ff-blue)] font-semibold text-sm hover:border-[var(--ff-blue)] hover:bg-[rgba(36,55,70,.04)] transition-colors"
            >
              All devotionals
            </Link>
          </div>
        </section>
      )}

      {/* ── Subscribe ────────────────────────────────────────────────────── */}
      <section className="bg-[var(--ff-blue)] py-24">
        <div className="max-w-content mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-4">
              ✦ Stay in the Word
            </p>
            <h2
              className="font-display text-[var(--ff-cream)] leading-tight mb-4"
              style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
            >
              Get the Daily Devotional — free.
            </h2>
            <p className="text-[var(--blue-300)] leading-relaxed">
              A short word each morning to keep you in Scripture and growing — right where you
              are. No spam. No cost. Just the Word.
            </p>
          </div>
          <div className="bg-white rounded-card p-8">
            <SubscribeForm />
          </div>
        </div>
      </section>
    </>
  );
}
