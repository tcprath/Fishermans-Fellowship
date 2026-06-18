import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
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
    <article className="group flex flex-col bg-white border border-[var(--line)] rounded-card overflow-hidden hover:-translate-y-0.5 transition-transform duration-200">
      <Link href={href} tabIndex={-1} aria-hidden>
        <div className="relative aspect-[4/3] bg-[var(--cream-200)]">
          <Image
            src={devotional.image_url}
            alt={devotional.title}
            fill
            className="object-cover"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-[var(--ff-blue)] opacity-30 mix-blend-multiply" />
        </div>
      </Link>
      <div className="flex flex-col flex-1 p-6">
        {date && (
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--muted)] mb-2">
            {date}
          </p>
        )}
        <h3 className="font-display text-xl text-[var(--ink)] leading-snug mb-2 group-hover:text-[var(--ff-blue)] transition-colors">
          <Link href={href}>{devotional.title}</Link>
        </h3>
        {devotional.scripture && (
          <p className="text-xs font-serif italic text-[var(--ff-gold)] mb-2">
            {devotional.scripture}
          </p>
        )}
        {devotional.excerpt && (
          <p className="text-sm text-[var(--ink-soft)] leading-relaxed line-clamp-3">
            {devotional.excerpt}
          </p>
        )}
      </div>
    </article>
  );
}
