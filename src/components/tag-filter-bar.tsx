import Link from "next/link";
import { Tag as TagIcon } from "lucide-react";
import type { TagRow } from "@/lib/supabase/types";

type Props = {
  tags: TagRow[];
  activeSlug?: string;
  basePath: string;
  extraParams?: Record<string, string>;
  className?: string;
};

function buildHref(basePath: string, tagSlug: string | null, extraParams?: Record<string, string>) {
  const qs = new URLSearchParams();
  if (tagSlug) qs.set("tag", tagSlug);
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

export default function TagFilterBar({
  tags,
  activeSlug,
  basePath,
  extraParams,
  className = "",
}: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft,#3E4E5A)] mr-1">
        <TagIcon className="size-3.5" />
        Filter
      </span>
      <Link
        href={buildHref(basePath, null, extraParams)}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.08em] transition-colors border ${
          !activeSlug
            ? "bg-[var(--ff-blue)] text-[var(--ff-cream)] border-[var(--ff-blue)]"
            : "bg-white text-[var(--ink-soft,#3E4E5A)] border-[var(--line)] hover:border-[var(--ff-blue)] hover:text-[var(--ff-blue)]"
        }`}
      >
        All
      </Link>
      {tags.map((t) => {
        const active = activeSlug === t.slug;
        return (
          <Link
            key={t.id}
            href={buildHref(basePath, t.slug, extraParams)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.08em] transition-colors border ${
              active
                ? "bg-[var(--ff-blue)] text-[var(--ff-cream)] border-[var(--ff-blue)]"
                : "bg-white text-[var(--ink-soft,#3E4E5A)] border-[var(--line)] hover:border-[var(--ff-blue)] hover:text-[var(--ff-blue)]"
            }`}
          >
            {t.name}
          </Link>
        );
      })}
    </div>
  );
}
