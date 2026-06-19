import Link from "next/link";
import type { TagRow } from "@/lib/supabase/types";

type Props = {
  tags: TagRow[];
  basePath: string; // e.g. "/devotionals" or "/fishermans-fellowship"
  className?: string;
  size?: "sm" | "md";
};

export default function TagChips({ tags, basePath, className = "", size = "sm" }: Props) {
  if (!tags || tags.length === 0) return null;
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((t) => (
        <Link
          key={t.id}
          href={`${basePath}?tag=${t.slug}`}
          className={`inline-flex items-center rounded-full bg-[var(--cream-200,#ECE2D4)] text-[var(--ff-blue)] font-semibold uppercase tracking-[0.1em] hover:bg-[var(--ff-blue)] hover:text-[var(--ff-cream)] transition-colors ${pad}`}
        >
          {t.name}
        </Link>
      ))}
    </div>
  );
}
