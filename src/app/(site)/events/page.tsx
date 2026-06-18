import type { Metadata } from "next";
import { getPublishedEvents } from "@/lib/content";
import EventsCalendar from "@/components/events-calendar";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming Fisherman's Fellowship events — tournaments, retreats, and fellowship gatherings.",
};

export default async function EventsPage() {
  const events = await getPublishedEvents();

  return (
    <>
      <section className="bg-[var(--ff-blue)] text-[var(--ff-cream)] pt-20 pb-16">
        <div className="max-w-content mx-auto px-5">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-4">
            ✦ Calendar
          </p>
          <h1
            className="font-display leading-tight"
            style={{ fontSize: "clamp(34px, 5vw, 52px)" }}
          >
            Upcoming Events
          </h1>
        </div>
      </section>

      <div className="max-w-content mx-auto px-5 py-12">
        <EventsCalendar events={events} />
      </div>
    </>
  );
}
