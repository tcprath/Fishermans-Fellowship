import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "We exist to share Jesus and build lasting brotherhood — called to be fishers of men, carrying one another for the Kingdom.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-72 flex items-end overflow-hidden">
        <Image
          src="/photos/section-dock.jpg"
          alt="Fishermen on a dock at blue hour"
          fill
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(27,42,54,.4) 0%, rgba(27,42,54,.85) 100%)",
          }}
        />
        <div className="relative z-10 max-w-content mx-auto px-5 pb-12 w-full">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-3">
            ✦ Our Heart
          </p>
          <h1
            className="font-display text-[var(--ff-cream)]"
            style={{ fontSize: "clamp(34px, 5vw, 52px)" }}
          >
            About the Ministry
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-content mx-auto px-5 py-20">
        <div className="max-w-2xl">
          <h2
            className="font-display text-[var(--ink)] leading-tight mb-6"
            style={{ fontSize: "clamp(24px, 3.5vw, 36px)" }}
          >
            Called to be fishers of men.
          </h2>
          <div className="prose prose-lg text-[var(--ink-soft)] max-w-none space-y-5">
            <p>
              Fisherman&apos;s Fellowship is a Christian ministry that brings fishermen together
              to grow in faith, stand with one another, and share the love of Jesus — on the
              water and beyond. It is built on Christ&apos;s call to become &ldquo;fishers of
              men,&rdquo; turning a shared love of fishing into a doorway for the Gospel.
            </p>
            <p>
              We exist to share the love and truth of Jesus Christ while building strong,
              lasting spiritual relationships — reaching people in practical, personal, and
              relational ways, meeting them wherever they are on their journey.
            </p>
            <p>
              Spiritual growth happens best through connection — with God, with His Word, and
              with one another. The ministry weaves three things into one mission:
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 my-12">
            {[
              {
                title: "Evangelism",
                body: "Reaching those who don't yet know Christ — at the tournament, on the retreat, and out on the water.",
              },
              {
                title: "Discipleship",
                body: "Helping believers grow and live faithfully through daily time in the Word and practical guidance.",
              },
              {
                title: "Mentorship",
                body: "Walking alongside one another for the long haul — carrying each other through a world at war.",
              },
            ].map((p) => (
              <div key={p.title} className="bg-[var(--ff-cream)] rounded-card p-6">
                <h3 className="font-display text-lg text-[var(--ff-blue)] mb-2">{p.title}</h3>
                <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="prose prose-lg text-[var(--ink-soft)] max-w-none space-y-5">
            <p>
              What makes Fisherman&apos;s Fellowship distinct is where we show up. People
              don&apos;t come for a ministry first — they come for the water. We go where
              fishermen already are and offer real brotherhood and a real Savior.{" "}
              <strong className="text-[var(--ink)]">The fishing is the on-ramp; Christ is
              the destination.</strong>
            </p>
            <p>
              Scripture is our anchor. Matthew 4:19 — &ldquo;Follow me, and I will make you
              fishers of men&rdquo; — is the founding call everything traces back to.
            </p>
          </div>

          <div className="mt-12 flex gap-4">
            <Link
              href="/fishermans-fellowship"
              className="inline-flex items-center gap-2 bg-[var(--ff-blue)] text-[var(--ff-cream)] hover:bg-[var(--blue-900)] transition-colors rounded-full px-7 py-3.5 font-semibold"
            >
              Explore the ministries
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-[var(--line)] text-[var(--ff-blue)] hover:border-[var(--ff-blue)] hover:bg-[rgba(36,55,70,.04)] transition-colors rounded-full px-7 py-3.5 font-semibold"
            >
              Get connected
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
