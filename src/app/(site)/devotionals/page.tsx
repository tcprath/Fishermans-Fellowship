import type { Metadata } from "next";
import { getPublishedDevotionals } from "@/lib/content";
import DevotionalCard from "@/components/devotional-card";

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
      <section className="bg-[var(--ff-blue)] text-[var(--ff-cream)] pt-20 pb-16">
        <div className="max-w-content mx-auto px-5">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-4">
            ✦ Daily Word
          </p>
          <h1
            className="font-display leading-tight mb-4"
            style={{ fontSize: "clamp(34px, 5vw, 52px)" }}
          >
            Daily Devotionals
          </h1>
          <p className="text-[var(--blue-300)] text-lg leading-relaxed max-w-xl">
            A free daily word to keep you in Scripture and growing — right where you are.
          </p>
        </div>
      </section>

      <div className="max-w-content mx-auto px-5 py-16">
        {devotionals.length === 0 ? (
          <p className="text-[var(--muted)] text-center py-24">
            No devotionals published yet — check back soon.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {devotionals
              .slice()
              .reverse()
              .map((d) => (
                <DevotionalCard key={d.id} devotional={d} />
              ))}
          </div>
        )}
      </div>
    </>
  );
}
