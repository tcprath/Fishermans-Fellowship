import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import SubscribeForm from "@/components/subscribe-form";

export default function CtaBanner() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <Image
        src="/photos/hero-fisherman-blue.jpg"
        alt=""
        aria-hidden="true"
        fill
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(27,42,54,0.82) 0%, rgba(27,42,54,0.92) 100%)" }}
      />
      <div className="relative z-10 max-w-[var(--max-w-content,1140px)] mx-auto px-6 sm:px-8 lg:px-5">
        <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[rgba(255,255,255,0.1)]">

          {/* ── Subscribe ── */}
          <div className="pb-10 md:pb-0 md:pr-14 flex flex-col items-center md:items-start text-center md:text-left">
            <p className="flex items-center justify-center md:justify-start gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-3">
              <Sparkle size={10} className="text-[var(--ff-gold)]" />
              Stay in the Word
            </p>
            <h2
              className="font-display text-[var(--ff-cream)] mb-3"
              style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
            >
              Get the daily devotional — free.
            </h2>
            <p className="text-[var(--blue-300,#9FAEBA)] leading-relaxed mb-8 max-w-sm">
              A short word each morning to keep you in Scripture and growing —
              right where you are. No spam. No cost. Just the Word.
            </p>
            <div className="bg-[rgba(255,255,255,0.12)] backdrop-blur-sm rounded-[16px] p-5 sm:p-6 w-full max-w-sm border border-[rgba(255,255,255,0.15)]">
              <SubscribeForm dark />
            </div>
          </div>

          {/* ── Donate ── */}
          <div className="pt-10 md:pt-0 md:pl-14 flex flex-col justify-center items-center md:items-start text-center md:text-left">
            <p className="flex items-center justify-center md:justify-start gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-3">
              <Sparkle size={10} className="text-[var(--ff-gold)]" />
              Partner with Us
            </p>
            <h2
              className="font-display text-[var(--ff-cream)] mb-3"
              style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
            >
              Join us in reaching fishermen for Christ.
            </h2>
            <p className="text-[var(--blue-300,#9FAEBA)] leading-relaxed mb-8 max-w-sm">
              Fisherman&apos;s Fellowship is 100% volunteer-led and crowd-funded.
              Every dollar goes directly to the mission — tournaments, retreats,
              and bringing the Gospel to the water.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full max-w-sm">
              <Link href="/donate" className="btn btn-gold justify-center">
                Support the mission
                <span className="btn-chip">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link href="/about" className="btn btn-ghost-light justify-center">
                Learn more
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
