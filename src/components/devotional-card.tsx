import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import type { DevotionalRow, TagRow } from "@/lib/supabase/types";
import TagChips from "@/components/tag-chips";

type Props = {
  devotional: DevotionalRow & { tags?: TagRow[] };
};

export default function DevotionalCard({ devotional }: Props) {
  const href = `/devotionals/${devotional.slug}`;
  const date = devotional.published_at
    ? format(new Date(devotional.published_at), "MMMM d, yyyy")
    : null;

  return (
    <article className="group relative flex flex-col bg-white border border-[rgba(189,154,95,0.25)] rounded-[20px] overflow-hidden hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(.32,.72,0,1)] shadow-[0_12px_28px_-14px_rgba(189,154,95,0.45),0_4px_10px_-4px_rgba(189,154,95,0.18)] hover:shadow-[0_24px_50px_-18px_rgba(189,154,95,0.6),0_8px_20px_-6px_rgba(189,154,95,0.3)]">
      {/* Gold top accent strip */}
      <span
        className="absolute inset-x-0 top-0 h-[3px] z-10"
        style={{ background: "linear-gradient(to right, transparent, var(--ff-gold), transparent)" }}
        aria-hidden
      />
      <Link href={href} tabIndex={-1} aria-hidden>
        <div className="relative aspect-[16/9] bg-[var(--cream-200)] overflow-hidden">
          <Image
            src={devotional.image_url || "/devotional-default.jpg"}
            alt={devotional.title}
            fill
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(.32,.72,0,1)] group-hover:scale-[1.03]"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-[var(--ff-blue)] opacity-25 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-15" />
        </div>
      </Link>

      <div className="relative flex flex-col flex-1 p-6 pt-10">
        {/* North-star icon centered on the image/text seam */}
        <span
          className="absolute left-1/2 -top-6 -translate-x-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-card border border-[var(--line)]"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-north-star.svg" alt="" className="w-9 h-9" />
        </span>
        {date && (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted-text,#6E7882)] mb-2">
            {date}
          </p>
        )}
        <h3 className="font-display text-xl text-[var(--ink)] leading-snug mb-2 group-hover:text-[var(--ff-blue)] transition-colors duration-200">
          <Link href={href}>{devotional.title}</Link>
        </h3>
        {devotional.scripture && (
          <p className="text-[15px] font-serif italic text-[var(--ff-gold)] mb-3 leading-relaxed">
            {devotional.scripture}
          </p>
        )}
        {devotional.excerpt && (
          <p className="text-sm text-[var(--ink-soft,#3E4E5A)] leading-relaxed line-clamp-3 mb-3 flex-1">
            {devotional.excerpt}
          </p>
        )}
        {devotional.tags && devotional.tags.length > 0 && (
          <TagChips tags={devotional.tags} basePath="/devotionals" className="mb-3" />
        )}
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ff-blue)] mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-end"
          aria-hidden
          tabIndex={-1}
        >
          Read <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
