import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight, BookOpen } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import type { PostWithTags, DevotionalWithTags } from "@/lib/supabase/types";

export type CarouselItem =
  | { kind: "post"; data: PostWithTags; blogSlug: string }
  | { kind: "devotional"; data: DevotionalWithTags };

type Props = {
  title: string;
  eyebrow?: string;
  viewAllHref: string;
  viewAllLabel?: string;
  items: CarouselItem[];
};

export default function RecentCarousel({
  title,
  eyebrow = "Keep Reading",
  viewAllHref,
  viewAllLabel = "View all",
  items,
}: Props) {
  if (items.length === 0) return null;

  return (
    <section className="bg-[var(--paper,#FBF8F2)] border-t border-[var(--line)]">
      <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
              <Sparkle size={10} className="text-[var(--ff-gold)]" />
              {eyebrow}
            </p>
            <h2
              className="font-display text-[var(--ink)] leading-tight"
              style={{ fontSize: "clamp(24px, 3.2vw, 34px)" }}
            >
              {title}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ff-blue)] hover:text-[var(--blue-700,#33485A)] transition-colors group shrink-0"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Scroll row */}
        <div className="-mx-5 px-5 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-5 pb-2 min-w-max">
            {items.map((item) => {
              const isPost = item.kind === "post";
              const data = item.data;
              const href = isPost
                ? `/${(item as { blogSlug: string }).blogSlug}/${data.slug}`
                : `/devotionals/${data.slug}`;
              const img = isPost
                ? (item.data as PostWithTags).hero_image_url
                : (item.data as DevotionalWithTags).image_url;
              const date = data.published_at
                ? format(new Date(data.published_at), "MMMM d, yyyy")
                : null;
              const scripture = isPost
                ? undefined
                : (item.data as DevotionalWithTags).scripture;
              const excerpt = (data as { excerpt: string | null }).excerpt;
              return (
                <li
                  key={`${item.kind}-${data.id}`}
                  className="w-[280px] sm:w-[320px] shrink-0 snap-start"
                >
                  <Link
                    href={href}
                    className="group flex flex-col h-full bg-white border border-[var(--line)] rounded-[18px] overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                  >
                    {img ? (
                      <div className="relative aspect-[16/10] bg-[var(--cream-200)] overflow-hidden">
                        <Image
                          src={img}
                          alt={data.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="320px"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-[var(--ff-blue)] flex items-center justify-center">
                        <BookOpen className="size-8 text-[var(--ff-gold)]" />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ff-gold)]">
                          {item.kind === "post" ? "Post" : "Devotional"}
                        </span>
                        {date && (
                          <span className="text-[10px] font-medium text-[var(--muted-text,#6E7882)]">
                            · {date}
                          </span>
                        )}
                      </div>
                      {scripture && (
                        <p className="font-serif italic text-[12px] text-[var(--ff-gold)] mb-1.5 line-clamp-1">
                          {scripture}
                        </p>
                      )}
                      <h3 className="font-display text-[18px] leading-tight text-[var(--ink)] mb-2 group-hover:text-[var(--ff-blue)] transition-colors line-clamp-2">
                        {data.title}
                      </h3>
                      {excerpt && (
                        <p className="text-sm text-[var(--ink-soft,#3E4E5A)] leading-relaxed line-clamp-3">
                          {excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sm:hidden mt-6">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ff-blue)]"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
