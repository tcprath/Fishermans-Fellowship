import type { Metadata } from "next";
import Image from "next/image";
import { Mail, BookOpen, Calendar, Heart, MapPin } from "lucide-react";
import ContactForm from "@/components/contact-form";
import { Sparkle } from "@/components/ui/sparkle";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach out to Fisherman's Fellowship — we'd love to hear from you.",
};

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const WAYS = [
  {
    icon: Heart,
    label: "Get connected",
    body: "Find your people — join the fellowship, connect with a mentor, or explore weekend retreats.",
  },
  {
    icon: BookOpen,
    label: "Daily devotional",
    body: "Start receiving a free daily word in your inbox — a short word to keep you in Scripture.",
  },
  {
    icon: Calendar,
    label: "Upcoming events",
    body: "Find us at a tournament or retreat near you. Check the calendar for upcoming gatherings.",
  },
  {
    icon: Mail,
    label: "General questions",
    body: "Whether you want to partner, serve, or just say hello — we'd love to hear from you.",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-[var(--ff-cream)] pt-24 pb-20">
        <Image
          src="/photos/hero-fisherman-blue.jpg"
          alt="Fisherman on the water at blue hour"
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
            Get in Touch
          </p>
          <h1
            className="font-display text-[var(--ff-cream)] max-w-xl"
            style={{ fontSize: "clamp(34px, 5vw, 56px)" }}
          >
            We&apos;d love to hear from you.
          </h1>
          <p className="text-[var(--blue-300,#9FAEBA)] mt-4 text-lg leading-relaxed max-w-lg">
            Reach out anytime — whether you want to get connected, have a question,
            or just want to say hello.
          </p>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-20 grid md:grid-cols-[1fr_1fr] gap-16">
        {/* Form */}
        <div>
          <div className="rounded-[20px] bg-white border border-[var(--line)] shadow-card p-7 md:p-9">
            <h2
              className="font-display text-[var(--ink)] mb-2"
              style={{ fontSize: "clamp(22px,3vw,30px)" }}
            >
              Send a message
            </h2>
            <p className="text-[var(--ink-soft,#3E4E5A)] mb-7 leading-relaxed">
              We&apos;ll get back to you as soon as we can — typically within a day or two.
            </p>
            <ContactForm />
          </div>

          {/* Social links */}
          <div className="mt-8 rounded-[20px] bg-[var(--ff-blue)] p-7 text-[var(--ff-cream)]">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-4">
              <Sparkle size={10} className="text-[var(--ff-gold)]" />
              Follow us on social media
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/fish_fellowship/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.18)] text-[var(--ff-cream)] text-[13px] font-semibold transition-colors duration-200"
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </a>
              <a
                href="https://www.facebook.com/fishermansfellowshipministries"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.18)] text-[var(--ff-cream)] text-[13px] font-semibold transition-colors duration-200"
              >
                <FacebookIcon className="h-4 w-4" />
                Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8 pt-1">
          {/* Ways to help */}
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-3">
              <Sparkle size={10} className="text-[var(--ff-gold)]" />
              How we can help
            </p>
            <div className="grid gap-4">
              {WAYS.map((w) => {
                const Icon = w.icon;
                return (
                  <div
                    key={w.label}
                    className="flex gap-4 p-5 rounded-[16px] bg-white border border-[var(--line)] shadow-card hover:shadow-card-hover transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--ff-blue)] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-[var(--ff-gold)]" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)] mb-0.5">{w.label}</p>
                      <p className="text-sm text-[var(--ink-soft,#3E4E5A)] leading-relaxed">{w.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Find out more + address + social */}
          <div className="rounded-[20px] bg-[var(--ff-blue)] p-7 text-[var(--ff-cream)]">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-3">
              <Sparkle size={10} className="text-[var(--ff-gold)]" />
              Find out more ways to help!
            </p>
            <p className="text-[var(--blue-300,#9FAEBA)] leading-relaxed mb-6">
              There are so many ways to support our mission. Contact us to find out more.
            </p>

            {/* Address */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[rgba(189,154,95,.18)] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="h-4 w-4 text-[var(--ff-gold)]" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--ff-cream)] mb-0.5">Fisherman&apos;s Fellowship</p>
                <p className="text-sm text-[var(--blue-300,#9FAEBA)]">PO Box 1202</p>
                <p className="text-sm text-[var(--blue-300,#9FAEBA)]">Dayton, TN 37321</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
