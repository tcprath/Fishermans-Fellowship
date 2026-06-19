import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getPublishedDevotionalStubs,
  getDevotionalBySlug,
  getRecentDevotionals,
} from "@/lib/content";
import { pickOfTheDay } from "@/lib/devotional-of-the-day";
import ShareButtons from "@/components/share-buttons";
import { Sparkle } from "@/components/ui/sparkle";

export default async function DevotionalOfTheDay() {
  const stubs = await getPublishedDevotionalStubs();
  const stub = pickOfTheDay(stubs);

  // Calendar-dated pick first; otherwise fall back to most recent published
  let devotional = stub ? await getDevotionalBySlug(stub.slug) : null;
  if (!devotional) {
    const [recent] = await getRecentDevotionals(1);
    devotional = recent ?? null;
  }

  if (!devotional) {
    return (
      <div className="rounded-card bg-(--cream-200) p-10 text-center text-(--muted-text,#6E7882) text-sm">
        No devotionals published yet — check back soon.
      </div>
    );
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/devotionals/${devotional.slug}`;

  return (
    <div
      className="relative overflow-hidden rounded-card text-(--ff-cream) shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] ring-1 ring-[rgba(189,154,95,0.18)]"
      style={{
        background:
          "linear-gradient(135deg, #15242F 0%, #11202C 45%, #0D1A24 100%)",
      }}
    >
      {/* Bottom gold accent strip */}
      <div
        className="absolute inset-x-0 bottom-0 h-[2px]"
        style={{ background: "linear-gradient(to right, transparent, var(--ff-gold), transparent)" }}
        aria-hidden
      />

      <div className="relative p-6 md:p-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-5 md:gap-10 items-center">
          {/* Left: content */}
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-[rgba(189,154,95,0.4)] bg-[rgba(189,154,95,0.06)] text-[10px] font-bold uppercase tracking-[0.24em] text-(--ff-gold)">
              <Sparkle size={9} className="text-(--ff-gold)" />
              Devotional of the Day
            </span>

            {devotional.scripture && (
              <div className="flex items-start gap-3 mb-4">
                <span className="block w-[3px] self-stretch rounded-full bg-(--ff-gold)" aria-hidden />
                <p className="font-serif italic text-(--ff-gold) text-[15px] md:text-base leading-snug tracking-wide">
                  {devotional.scripture}
                </p>
              </div>
            )}

            <h3
              className="font-display text-(--ff-cream) leading-[1.1] mb-2.5"
              style={{ fontSize: "clamp(20px, 2.2vw, 26px)" }}
            >
              {devotional.title}
            </h3>

            {devotional.excerpt && (
              <p className="font-serif italic text-[var(--blue-300,#9FAEBA)] text-[15px] leading-relaxed line-clamp-3 max-w-xl">
                &ldquo;{devotional.excerpt}&rdquo;
              </p>
            )}
          </div>

          {/* Right: CTA + share */}
          <div className="flex flex-col items-stretch md:items-end gap-3 shrink-0">
            <Link href={`/devotionals/${devotional.slug}`} className="btn btn-gold whitespace-nowrap">
              Read today&apos;s word
              <span className="btn-chip">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <div className="flex items-center justify-end">
              <ShareButtons url={url} title={devotional.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
