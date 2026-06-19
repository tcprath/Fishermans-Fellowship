import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import type { DevotionalRow } from "@/lib/supabase/types";

type Props = {
  devotional: DevotionalRow;
};

export default function DevotionalCard({ devotional }: Props) {
  const href = `/devotionals/${devotional.slug}`;
  const date = devotional.published_at
    ? format(new Date(devotional.published_at), "MMMM d, yyyy")
    : null;

  return (
    <article className="group flex flex-col bg-white border border-[var(--line)] rounded-[20px] overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(.32,.72,0,1)]">
      <Link href={href} tabIndex={-1} aria-hidden>
        <div className="relative aspect-[4/3] bg-[var(--cream-200)] overflow-hidden">
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
      <div className="flex flex-col flex-1 p-6">
        {date && (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted-text,#6E7882)] mb-2">
            {date}
          </p>
        )}
        <h3 className="font-display text-xl text-[var(--ink)] leading-snug mb-2 group-hover:text-[var(--ff-blue)] transition-colors duration-200">
          <Link href={href}>{devotional.title}</Link>
        </h3>
        {devotional.scripture && (
          <p className="text-xs font-serif italic text-[var(--ff-gold)] mb-2 leading-relaxed">
            {devotional.scripture}
          </p>
        )}
        {devotional.excerpt && (
          <p className="text-sm text-[var(--ink-soft,#3E4E5A)] leading-relaxed line-clamp-3 mb-3 flex-1">
            {devotional.excerpt}
          </p>
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
