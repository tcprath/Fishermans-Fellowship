import Image from "next/image";
import Link from "next/link";
import { getPublishedDevotionals } from "@/lib/content";
import { pickOfTheDay } from "@/lib/devotional-of-the-day";
import ShareButtons from "@/components/share-buttons";

export default async function DevotionalOfTheDay() {
  const catalog = await getPublishedDevotionals();
  const devotional = pickOfTheDay(catalog);

  if (!devotional) {
    return (
      <div className="rounded-card bg-[var(--cream-200)] p-8 text-center text-[var(--muted)] text-sm">
        No devotionals published yet.
      </div>
    );
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/devotionals/${devotional.slug}`;

  return (
    <div className="rounded-card overflow-hidden bg-[var(--ff-blue)] text-[var(--ff-cream)] grid md:grid-cols-2">
      {/* Image */}
      <div className="relative aspect-[4/3] md:aspect-auto min-h-60">
        <Image
          src={devotional.image_url}
          alt={devotional.title}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 50vw"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(27,42,54,.3) 0%, rgba(27,42,54,.7) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col p-8 md:p-10 justify-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)]">
          ✦ Devotional of the Day
        </p>
        {devotional.scripture && (
          <p className="font-serif italic text-[var(--gold-300)] text-sm">
            {devotional.scripture}
          </p>
        )}
        <h3 className="font-display text-[clamp(22px,3vw,32px)] text-[var(--ff-cream)] leading-tight">
          {devotional.title}
        </h3>
        {devotional.excerpt && (
          <p className="text-[var(--blue-300)] text-sm leading-relaxed line-clamp-4">
            {devotional.excerpt}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link
            href={`/devotionals/${devotional.slug}`}
            className="inline-flex items-center justify-center gap-2 bg-[var(--ff-gold)] text-[var(--ff-blue)] hover:bg-[var(--gold-700)] transition-colors rounded-full px-6 py-2.5 font-semibold text-sm"
          >
            Read today&apos;s word
          </Link>
          <ShareButtons url={url} title={devotional.title} />
        </div>
      </div>
    </div>
  );
}
