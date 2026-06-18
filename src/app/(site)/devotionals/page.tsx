import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { getPublishedDevotionals } from "@/lib/content";
import DevotionalCard from "@/components/devotional-card";
import { Sparkle } from "@/components/ui/sparkle";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Devotionals",
  description:
    "Daily devotionals from Fisherman's Fellowship — a free word each morning to keep you in Scripture and growing.",
};

export default async function DevotionalsPage() {
  const devotionals = await getPublishedDevotionals();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-[var(--ff-cream)] pt-24 pb-20">
        <Image
          src="/photos/fellowship-pic.jpg"
          alt="Fishing boat on the water at sunset"
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
            Daily Word
          </p>
          <h1
            className="font-display text-[var(--ff-cream)] mb-4 max-w-xl"
            style={{ fontSize: "clamp(34px, 5vw, 56px)" }}
          >
            Daily Devotionals
          </h1>
          <p className="text-[var(--blue-300,#9FAEBA)] text-lg leading-relaxed max-w-lg">
            A free daily word to keep you in Scripture and growing — right where you are.
          </p>
        </div>
      </section>

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-16">
        {devotionals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--ff-blue)] flex items-center justify-center mb-6">
              <BookOpen className="h-7 w-7 text-[var(--ff-gold)]" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl text-[var(--ink)] mb-3">
              No devotionals yet
            </h2>
            <p className="text-[var(--ink-soft,#3E4E5A)] max-w-sm leading-relaxed mb-8">
              The first devotional is coming soon. Subscribe below to get it the
              moment it&apos;s published.
            </p>
            <Link href="/?subscribe=1" className="btn btn-primary">
              Subscribe — it&apos;s free
              <span className="btn-chip">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {devotionals
              .slice()
              .reverse()
              .map((d, i) => (
                <div key={d.id} data-reveal data-delay={String((i % 3) * 100)}>
                  <DevotionalCard devotional={d} />
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
