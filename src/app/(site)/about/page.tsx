import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Target, Users, Compass, Handshake } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";

export const metadata: Metadata = {
  title: "About",
  description:
    "We exist to share Jesus and build lasting brotherhood — called to be fishers of men, carrying one another for the Kingdom.",
};

const PILLARS = [
  {
    icon: Target,
    title: "Evangelism",
    body: "Reaching those who don't yet know Christ — at the tournament, on the retreat, and out on the water.",
  },
  {
    icon: Users,
    title: "Discipleship",
    body: "Helping believers grow and live faithfully through daily time in the Word and practical guidance.",
  },
  {
    icon: Compass,
    title: "Mentorship",
    body: "Walking alongside one another for the long haul — carrying each other through a world at war.",
  },
  {
    icon: Handshake,
    title: "Fellowship",
    body: "Real brotherhood on and off the water — shared meals, shared trials, and the steady presence of believers who show up.",
  },
];

function PillarGraphic() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 480"
      preserveAspectRatio="none"
      className="hidden sm:block absolute -top-8 -bottom-8 -left-14 w-[68%] h-[calc(100%+64px)] z-0 pointer-events-none"
      style={{ color: "var(--ff-gold)" }}
    >
      {/* Capital (top, wider) */}
      <rect x="6"  y="14" width="88" height="8"  fill="currentColor" opacity="0.32" />
      <rect x="2"  y="22" width="96" height="10" fill="currentColor" opacity="0.26" />
      <rect x="10" y="32" width="80" height="22" fill="currentColor" opacity="0.20" />
      {/* Necking */}
      <rect x="14" y="54" width="72" height="4"  fill="currentColor" opacity="0.30" />
      {/* Shaft */}
      <rect x="20" y="58" width="60" height="370" fill="currentColor" opacity="0.18" />
      {/* Fluting lines */}
      <g opacity="0.36" stroke="currentColor" strokeWidth="1.2" fill="none">
        <line x1="30" y1="60" x2="30" y2="426" />
        <line x1="40" y1="60" x2="40" y2="426" />
        <line x1="50" y1="60" x2="50" y2="426" />
        <line x1="60" y1="60" x2="60" y2="426" />
        <line x1="70" y1="60" x2="70" y2="426" />
      </g>
      {/* Base */}
      <rect x="14" y="426" width="72" height="6"  fill="currentColor" opacity="0.30" />
      <rect x="10" y="432" width="80" height="20" fill="currentColor" opacity="0.20" />
      <rect x="2"  y="452" width="96" height="12" fill="currentColor" opacity="0.26" />
      <rect x="6"  y="464" width="88" height="10" fill="currentColor" opacity="0.32" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-[var(--ff-cream)] pt-24 pb-20">
        <Image
          src="/photos/section-dock.jpg"
          alt="Fishermen gathered on a dock"
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
            Our Heart
          </p>
          <h1
            className="font-display text-[var(--ff-cream)] max-w-xl mb-4"
            style={{ fontSize: "clamp(34px, 5vw, 56px)" }}
          >
            About the Ministry
          </h1>
          <p className="text-[var(--blue-300,#9FAEBA)] text-lg leading-relaxed max-w-xl">
            We exist to share Jesus and build lasting brotherhood — called to be fishers of men,
            carrying one another for the Kingdom.
          </p>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <section className="max-w-(--max-w-content,1140px) mx-auto px-5 py-20">
        <h2
          className="font-display text-(--ink) mb-8"
          style={{ fontSize: "clamp(24px, 3.2vw, 36px)", textWrap: "balance" } as React.CSSProperties}
        >
          Called to be fishers of men.
        </h2>

        {/* Body — 2 columns */}
        <div className="columns-1 md:columns-2 gap-10 text-(--ink-soft,#3E4E5A) text-[17px] leading-[1.7] [&>p]:mb-5 [&>p:last-child]:mb-0">
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
            What makes Fisherman&apos;s Fellowship distinct is where we show up. People
            don&apos;t come for a ministry first — they come for the water. We go where
            fishermen already are and offer real brotherhood and a real Savior.{" "}
            <strong className="text-(--ink) font-semibold">
              The fishing is the on-ramp; Christ is the destination.
            </strong>
          </p>
          <p>
            Scripture is our anchor. Matthew 4:19 — &ldquo;Follow me, and I will make you
            fishers of men&rdquo; — is the founding call everything traces back to. Spiritual
            growth happens best through connection — with God, with His Word, and with one
            another. The ministry weaves four pillars into one mission.
          </p>
        </div>

        {/* Pillars with icons + classical pillar SVG behind */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-9 my-20 pt-6">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="relative">
                <PillarGraphic />
                <div className="relative z-10 bg-(--ff-blue) rounded-card p-7 text-(--ff-cream) shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-brand">
                  <div className="w-10 h-10 rounded-full bg-[rgba(189,154,95,.18)] flex items-center justify-center mb-5">
                    <Icon className="h-5 w-5 text-(--ff-gold)" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-[19px] text-(--ff-cream) mb-2">{p.title}</h3>
                  <p className="text-sm text-(--blue-300,#9FAEBA) leading-relaxed">{p.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/fishermans-fellowship" className="btn btn-primary">
            Explore the ministries
            <span className="btn-chip">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Get connected
          </Link>
        </div>
      </section>
    </>
  );
}
