import Link from "next/link";
import { ArrowUpRight, BookOpen, Play, Headphones, BookMarked, FileText, LinkIcon } from "lucide-react";
import type { ResourceRow, ResourceType, TagRow } from "@/lib/supabase/types";

type Resource = ResourceRow & { tags?: TagRow[] };

const TYPE_META: Record<
  ResourceType,
  { label: string; Icon: typeof BookOpen }
> = {
  post:    { label: "Article",     Icon: FileText },
  book:    { label: "Book",        Icon: BookOpen },
  video:   { label: "Video",       Icon: Play },
  podcast: { label: "Podcast",     Icon: Headphones },
  study:   { label: "Bible Study", Icon: BookMarked },
  article: { label: "Article",     Icon: FileText },
  link:    { label: "Link",        Icon: LinkIcon },
};

function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

export default function ResourceCard({
  resource,
  variant = "default",
}: {
  resource: Resource;
  variant?: "default" | "featured";
}) {
  const meta = TYPE_META[resource.type];
  const Icon = meta.Icon;
  const href = ["post", "study"].includes(resource.type)
    ? `/resources/${resource.slug}`
    : (resource.url ?? `/resources/${resource.slug}`);
  const external = isExternal(href);
  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  const isFeatured = variant === "featured";

  return (
    <Link
      href={href}
      {...linkProps}
      className={`group relative flex flex-col bg-white border border-[var(--line)] rounded-[20px] overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(.32,.72,0,1)] ${
        isFeatured ? "p-7 md:p-9" : "p-6"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--cream-200,#ECE2D4)] text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ff-blue)]">
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
        <ArrowUpRight className="h-4 w-4 text-[var(--ink-soft,#3E4E5A)] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
      </div>

      <h3
        className="font-display text-[var(--ink)] leading-tight mb-2 group-hover:text-[var(--ff-blue)] transition-colors duration-200"
        style={{ fontSize: isFeatured ? "clamp(20px, 2vw, 26px)" : "18px" }}
      >
        {resource.title}
      </h3>

      {resource.author && (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ff-gold)] mb-3">
          {resource.author}
        </p>
      )}

      {resource.description && (
        <p className="text-sm text-[var(--ink-soft,#3E4E5A)] leading-relaxed flex-1">
          {resource.description}
        </p>
      )}

      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {resource.tags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center rounded-full bg-[var(--cream-200,#ECE2D4)] text-[var(--ff-blue)] text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
