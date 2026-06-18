import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Mail, MapPin, Shield, Users, BookOpen, Anchor, Video, Globe } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Fisherman's Fellowship — a 100% volunteer-led, crowd-funded ministry bringing the Gospel to the fishing community.",
};

const PILLARS = [
  {
    icon: Anchor,
    title: "Tournament Fellowship",
    body: "Fellowship meetings at fishing tournaments and outreach events across the region.",
  },
  {
    icon: Users,
    title: "Retreats & Missions",
    body: "Weekend retreats, extra-curricular activities, and mission trips that build real brotherhood.",
  },
  {
    icon: Heart,
    title: "Prayer & Mentorship",
    body: "One-on-one prayer and mentorship ministry — walking alongside men for the long haul.",
  },
  {
    icon: BookOpen,
    title: "Evangelism & Discipleship",
    body: "Reaching those who don't yet know Christ and helping believers grow in their faith daily.",
  },
];

const NEEDS = [
  { icon: Globe,   label: "Travel expenses",           detail: "Tournaments, retreats, and speaking engagements" },
  { icon: Globe,   label: "Website & publications",    detail: "Newsletters, articles, books, and content" },
  { icon: Video,   label: "Production costs",          detail: "Video series, social media, evangelism content" },
  { icon: BookOpen,label: "Ministry materials",        detail: "Bibles, devotionals, and discipleship tools" },
  { icon: Users,   label: "Retreat operations",        detail: "Facilities and operating costs for weekends" },
  { icon: Shield,  label: "Administrative costs",      detail: "501(c)(3) compliance and ministry overhead" },
];

const ZEFFY_URL = "https://www.zeffy.com/en-US/donation-form/1c889cf6-8f74-43f8-9204-45e0b3f85224";
const PAYPAL_URL =
  "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=fish%40fishermansfellowship.com&currency_code=USD&source=url";

export default function DonatePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-[var(--ff-cream)] pt-24 pb-24">
        <Image
          src="/photos/fellowship-pic.jpg"
          alt="Fishing boat on the water at sunset"
          fill
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(27,42,54,0.55) 0%, rgba(27,42,54,0.85) 100%)" }}
        />
        <div className="relative z-10 max-w-[var(--max-w-content,1140px)] mx-auto px-5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
            <Sparkle size={10} className="text-[var(--ff-gold)]" />
            Support the Mission
          </p>
          <h1
            className="font-display text-[var(--ff-cream)] max-w-2xl mb-5"
            style={{ fontSize: "clamp(34px, 5vw, 60px)", textWrap: "balance" } as React.CSSProperties}
          >
            Partner with us to reach fishermen for Christ.
          </h1>
          <p className="text-[var(--blue-300,#9FAEBA)] text-lg leading-relaxed max-w-xl mb-10">
            Fisherman&apos;s Fellowship is 100% volunteer-led and crowd-funded. Every dollar
            goes directly to reaching men with the Gospel — on the water and beyond.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={ZEFFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              Donate via Zeffy
              <span className="btn-chip">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
            <a
              href={PAYPAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost-light"
            >
              Donate via PayPal
            </a>
          </div>

          {/* Zeffy callout */}
          <div className="mt-8 inline-flex items-center gap-2 bg-[rgba(189,154,95,.15)] border border-[rgba(189,154,95,.25)] rounded-full px-4 py-2">
            <Shield className="h-3.5 w-3.5 text-[var(--ff-gold)] shrink-0" />
            <p className="text-[12px] text-[var(--blue-300,#9FAEBA)]">
              <span className="text-[var(--ff-gold)] font-semibold">Zeffy is our preferred platform</span>
              {" "}— 100% free with zero transaction fees, so every dollar reaches the ministry.
            </p>
          </div>
        </div>
      </section>

      {/* ── 501c3 Trust bar ───────────────────────────────────────────────── */}
      <div className="bg-[var(--cream-200,#ECE2D4)] border-b border-[var(--line)]">
        <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-4 flex flex-wrap items-center gap-x-8 gap-y-2">
          <div className="flex items-center gap-2 text-[13px] text-[var(--ink-soft,#3E4E5A)]">
            <Shield className="h-4 w-4 text-[var(--ff-gold)] shrink-0" />
            <span><strong className="text-[var(--ink)] font-semibold">501(c)(3) Nonprofit</strong> — Donations are tax-deductible</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[var(--ink-soft,#3E4E5A)]">
            <Users className="h-4 w-4 text-[var(--ff-gold)] shrink-0" />
            <span><strong className="text-[var(--ink)] font-semibold">100% Volunteer Leadership</strong> — No salaries, just mission</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[var(--ink-soft,#3E4E5A)]">
            <Heart className="h-4 w-4 text-[var(--ff-gold)] shrink-0" />
            <span><strong className="text-[var(--ink)] font-semibold">Crowd Funded</strong> — Every gift moves the mission forward</span>
          </div>
        </div>
      </div>

      {/* ── Where your gift goes ──────────────────────────────────────────── */}
      <section className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-24">
        <div className="max-w-2xl mb-14">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
            <Sparkle size={10} className="text-[var(--ff-gold)]" />
            Four Pillars
          </p>
          <h2
            className="font-display text-[var(--ink)] mb-5"
            style={{ fontSize: "clamp(26px, 3.5vw, 40px)" }}
          >
            What your donation supports.
          </h2>
          <p className="text-[var(--ink-soft,#3E4E5A)] text-lg leading-relaxed">
            Donations fuel all four pillars of the Fisherman&apos;s Fellowship mission —
            everything from tournament outreach to discipleship and mentorship.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="bg-[var(--ff-blue)] rounded-[20px] p-7 text-[var(--ff-cream)] shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(.32,.72,0,1)]"
              >
                <div className="w-10 h-10 rounded-full bg-[rgba(189,154,95,.18)] flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-[var(--ff-gold)]" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-[18px] text-[var(--ff-cream)] mb-2">{p.title}</h3>
                <p className="text-sm text-[var(--blue-300,#9FAEBA)] leading-relaxed">{p.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Immediate Needs ───────────────────────────────────────────────── */}
      <section className="bg-[var(--ff-cream)] py-24">
        <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
                <Sparkle size={10} className="text-[var(--ff-gold)]" />
                Immediate Needs
              </p>
              <h2
                className="font-display text-[var(--ink)] mb-5"
                style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
              >
                How your gift is used right now.
              </h2>
              <p className="text-[var(--ink-soft,#3E4E5A)] leading-relaxed mb-8">
                We are fully crowd-funded — speaking engagements, prayer ministry travel,
                and fellowship gatherings are all covered by supporters like you. Every
                leader is a volunteer who currently covers their own expenses.
              </p>
              <p className="text-[var(--ink-soft,#3E4E5A)] leading-relaxed">
                We ask retreat participants to cover only their direct expenses.
                Your gift helps us reimburse our volunteers and keep the ministry
                growing without barriers.
              </p>
            </div>

            <div className="grid gap-3">
              {NEEDS.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.label}
                    className="flex items-start gap-4 bg-white rounded-[16px] border border-[var(--line)] p-5 shadow-card hover:shadow-card-hover transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--ff-blue)] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-[var(--ff-gold)]" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)] mb-0.5">{n.label}</p>
                      <p className="text-sm text-[var(--ink-soft,#3E4E5A)] leading-relaxed">{n.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Donation options ─────────────────────────────────────────────── */}
      <section className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-24">
        <div className="text-center mb-14">
          <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
            <Sparkle size={10} className="text-[var(--ff-gold)]" />
            Give Today
          </p>
          <h2
            className="font-display text-[var(--ink)] mb-4"
            style={{ fontSize: "clamp(26px, 3.5vw, 40px)" }}
          >
            Three ways to give.
          </h2>
          <p className="text-[var(--ink-soft,#3E4E5A)] max-w-lg mx-auto leading-relaxed">
            Choose what works best for you. Every method goes directly to the ministry.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Zeffy — preferred */}
          <div className="relative bg-[var(--ff-blue)] rounded-[20px] p-8 text-[var(--ff-cream)] shadow-card-hover flex flex-col">
            <div className="absolute -top-3 left-8">
              <span className="bg-[var(--ff-gold)] text-[var(--ff-blue)] text-[11px] font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full">
                Preferred
              </span>
            </div>
            <div className="w-11 h-11 rounded-full bg-[rgba(189,154,95,.18)] flex items-center justify-center mb-5 mt-3">
              <Shield className="h-5 w-5 text-[var(--ff-gold)]" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-[22px] text-[var(--ff-cream)] mb-2">Zeffy</h3>
            <p className="text-sm text-[var(--blue-300,#9FAEBA)] leading-relaxed mb-6 flex-1">
              100% free platform with zero transaction fees — the most of your gift
              reaches the ministry.
            </p>
            <a
              href={ZEFFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold w-full justify-center"
            >
              Donate via Zeffy
              <span className="btn-chip">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </div>

          {/* PayPal */}
          <div className="bg-white rounded-[20px] border border-[var(--line)] p-8 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col">
            <div className="w-11 h-11 rounded-full bg-[var(--ff-blue)] flex items-center justify-center mb-5">
              <Globe className="h-5 w-5 text-[var(--ff-gold)]" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-[22px] text-[var(--ink)] mb-2">PayPal</h3>
            <p className="text-sm text-[var(--ink-soft,#3E4E5A)] leading-relaxed mb-6 flex-1">
              Donate securely via PayPal using your PayPal balance, bank account,
              or credit card.
            </p>
            <a
              href={PAYPAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full justify-center"
            >
              Donate via PayPal
              <span className="btn-chip">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </div>

          {/* Mail */}
          <div className="bg-white rounded-[20px] border border-[var(--line)] p-8 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col">
            <div className="w-11 h-11 rounded-full bg-[var(--ff-blue)] flex items-center justify-center mb-5">
              <Mail className="h-5 w-5 text-[var(--ff-gold)]" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-[22px] text-[var(--ink)] mb-2">By Mail</h3>
            <p className="text-sm text-[var(--ink-soft,#3E4E5A)] leading-relaxed mb-4 flex-1">
              Send a check payable to{" "}
              <strong className="text-[var(--ink)] font-semibold">
                Fisherman&apos;s Fellowship Ministries
              </strong>{" "}
              to our mailing address.
            </p>
            <div className="flex items-start gap-3 bg-[var(--paper,#FBF8F2)] rounded-[12px] p-4 border border-[var(--line)]">
              <MapPin className="h-4 w-4 text-[var(--ff-gold)] shrink-0 mt-0.5" strokeWidth={1.75} />
              <address className="not-italic text-sm text-[var(--ink-soft,#3E4E5A)] leading-relaxed">
                Fisherman&apos;s Fellowship Ministries<br />
                PO Box 1202<br />
                Dayton, TN 37321
              </address>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────────── */}
      <section className="bg-[var(--ff-blue)] py-24">
        <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 text-center">
          <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
            <Sparkle size={10} className="text-[var(--ff-gold)]" />
            Thank You
          </p>
          <h2
            className="font-display text-[var(--ff-cream)] max-w-2xl mx-auto mb-5"
            style={{ fontSize: "clamp(26px, 3.5vw, 42px)", textWrap: "balance" } as React.CSSProperties}
          >
            Thank you for your support, prayer, and encouragement.
          </h2>
          <p className="text-[var(--blue-300,#9FAEBA)] max-w-lg mx-auto leading-relaxed mb-10">
            No one is paid to be part of Fisherman&apos;s Fellowship — every leader
            is a volunteer. Your gift helps us cover their expenses and keep bringing
            the Word of God to the fishing community.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={ZEFFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              Give Now
              <span className="btn-chip">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
            <Link href="/contact" className="btn btn-ghost-light">
              Get in Touch
            </Link>
          </div>
          <p className="mt-8 text-[12px] text-[var(--blue-300,#9FAEBA)] opacity-70">
            Fisherman&apos;s Fellowship Ministries, Inc. is a 501(c)(3) non-profit.
            All donations are tax-deductible to the extent permitted by law.
          </p>
        </div>
      </section>
    </>
  );
}
