import type { Metadata } from "next";
import Image from "next/image";
import { getPublishedEvents } from "@/lib/content";
import EventsCalendar from "@/components/events-calendar";
import { Sparkle } from "@/components/ui/sparkle";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming Fisherman's Fellowship events — tournaments, retreats, and fellowship gatherings.",
};

export default async function EventsPage() {
  const events = await getPublishedEvents();

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
            Calendar
          </p>
          <h1
            className="font-display text-[var(--ff-cream)] max-w-xl"
            style={{ fontSize: "clamp(34px, 5vw, 56px)" }}
          >
            Upcoming Events
          </h1>
          <p className="text-[var(--blue-300,#9FAEBA)] mt-4 text-lg leading-relaxed max-w-lg">
            Tournaments, retreats, and fellowship gatherings — find us wherever the water
            takes you.
          </p>
        </div>
      </section>

      {/* ── Calendar ───────────────────────────────────────────────────────── */}
      <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-14">
        <div className="bg-white rounded-[20px] border border-[var(--line)] shadow-card p-6 sm:p-8">
          <EventsCalendar events={events} />
        </div>
      </div>
    </>
  );
}
