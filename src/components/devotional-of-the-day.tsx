import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedDevotionalStubs, getDevotionalBySlug } from "@/lib/content";
import { pickOfTheDay } from "@/lib/devotional-of-the-day";
import ShareButtons from "@/components/share-buttons";
import { Sparkle } from "@/components/ui/sparkle";

const DEFAULT_IMAGE = "/devotional-default.jpg";

export default async function DevotionalOfTheDay() {
  const stubs = await getPublishedDevotionalStubs();
  const stub = pickOfTheDay(stubs);

  if (!stub) {
    return (
      <div className="rounded-card bg-(--cream-200) p-10 text-center text-(--muted-text,#6E7882) text-sm">
        No devotionals published yet — check back soon.
      </div>
    );
  }

  const devotional = await getDevotionalBySlug(stub.slug);

  if (!devotional) {
    return (
      <div className="rounded-card bg-(--cream-200) p-10 text-center text-(--muted-text,#6E7882) text-sm">
        No devotionals published yet — check back soon.
      </div>
    );
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/devotionals/${devotional.slug}`;
  const imageSrc = devotional.image_url || DEFAULT_IMAGE;

  return (
    <div className="rounded-card overflow-hidden bg-(--ff-blue) text-(--ff-cream) grid md:grid-cols-2 shadow-card-hover">
      {/* Image */}
      <div className="relative aspect-4/3 md:aspect-auto min-h-64">
        <Image
          src={imageSrc}
          alt={devotional.title}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 50vw"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, rgba(27,42,54,.2) 0%, rgba(27,42,54,.6) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col p-8 md:p-12 justify-center gap-4">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-(--ff-gold)">
          <Sparkle size={10} className="text-(--ff-gold)" />
          Devotional of the Day
        </p>
        {devotional.scripture && (
          <p className="font-serif italic text-(--gold-300,#D8C39C) text-sm leading-relaxed">
            {devotional.scripture}
          </p>
        )}
        <h3
          className="font-display text-(--ff-cream) leading-tight"
          style={{ fontSize: "clamp(22px,3vw,30px)" }}
        >
          {devotional.title}
        </h3>
        {devotional.excerpt && (
          <p className="text-(--blue-300,#9FAEBA) text-sm leading-relaxed line-clamp-4">
            {devotional.excerpt}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link href={`/devotionals/${devotional.slug}`} className="btn btn-gold">
            Read today&apos;s word
            <span className="btn-chip">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <div className="flex items-center">
            <ShareButtons url={url} title={devotional.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
