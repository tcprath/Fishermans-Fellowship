import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Target, Users, Compass } from "lucide-react";
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
];

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
        <div className="max-w-2xl">
          <h2
            className="font-display text-(--ink) mb-6"
            style={{ fontSize: "clamp(24px, 3.5vw, 38px)" }}
          >
            Called to be fishers of men.
          </h2>
          <div className="space-y-5 text-(--ink-soft,#3E4E5A) text-[17px] leading-[1.7]">
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
        </div>

        {/* Pillars with icons */}
        <div className="grid sm:grid-cols-3 gap-5 my-14">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="bg-(--ff-blue) rounded-card p-7 text-(--ff-cream) shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-brand"
              >
                <div className="w-10 h-10 rounded-full bg-[rgba(189,154,95,.18)] flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-(--ff-gold)" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-[19px] text-(--ff-cream) mb-2">{p.title}</h3>
                <p className="text-sm text-(--blue-300,#9FAEBA) leading-relaxed">{p.body}</p>
              </div>
            );
          })}
        </div>

        <div className="max-w-2xl space-y-5 text-(--ink-soft,#3E4E5A) text-[17px] leading-[1.7]">
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
            fishers of men&rdquo; — is the founding call everything traces back to.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
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
