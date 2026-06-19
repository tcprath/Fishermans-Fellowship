import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Search, Tag as TagIcon, BookOpen, Mail } from "lucide-react";
import { Sparkle } from "@/components/ui/sparkle";
import ShareButtons from "@/components/share-buttons";
import type {
  PostWithTags,
  DevotionalWithTags,
  TagRow,
} from "@/lib/supabase/types";

type RelatedItem =
  | { kind: "post"; data: PostWithTags; blogSlug: string }
  | { kind: "devotional"; data: DevotionalWithTags };

type Props = {
  basePath: string;          // /fishermans-fellowship or /devotionals
  searchPlaceholder: string;
  shareUrl: string;
  shareTitle: string;
  related: RelatedItem[];
  tags: TagRow[];
  topicHeading?: string;
};

export default function PostSidebar({
  basePath,
  searchPlaceholder,
  shareUrl,
  shareTitle,
  related,
  tags,
  topicHeading = "Browse by topic",
}: Props) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 self-start">
      {/* Search */}
      <section className="rounded-[16px] bg-white border border-[var(--line)] shadow-card p-5">
        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft,#3E4E5A)] mb-3">
          <Search className="size-3.5" />
          Search
        </h3>
        <form action={basePath} method="get" role="search" className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--muted-text,#6E7882)]"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-9 pr-3 rounded-full border border-[var(--line)] bg-[var(--paper,#FBF8F2)] text-sm placeholder:text-[var(--muted-text,#6E7882)] focus:outline-none focus:border-[var(--ff-gold)] focus:bg-white transition-colors"
          />
        </form>
      </section>

      {/* Tags */}
      {tags.length > 0 && (
        <section className="rounded-[16px] bg-white border border-[var(--line)] shadow-card p-5">
          <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft,#3E4E5A)] mb-3">
            <TagIcon className="size-3.5" />
            {topicHeading}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Link
                key={t.id}
                href={`${basePath}?tag=${t.slug}`}
                className="inline-flex items-center rounded-full bg-[var(--cream-200,#ECE2D4)] text-[var(--ff-blue)] text-[10px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 hover:bg-[var(--ff-blue)] hover:text-[var(--ff-cream)] transition-colors"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Share */}
      <section className="rounded-[16px] bg-white border border-[var(--line)] shadow-card p-5">
        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft,#3E4E5A)] mb-3">
          <Sparkle size={9} className="text-[var(--ff-gold)]" />
          Share this
        </h3>
        <ShareButtons url={shareUrl} title={shareTitle} variant="light" />
      </section>

      {/* Subscribe CTA */}
      <section
        className="rounded-[16px] p-6 text-[var(--ff-cream)]"
        style={{
          background: "linear-gradient(135deg, #15242F 0%, #11202C 50%, #0D1A24 100%)",
        }}
      >
        <Mail className="size-5 text-[var(--ff-gold)] mb-3" />
        <h3 className="font-display text-[18px] leading-tight mb-2 text-[var(--ff-cream)]">
          A word in your inbox.
        </h3>
        <p className="text-xs text-[var(--blue-300,#9FAEBA)] leading-relaxed mb-4">
          Daily devotionals + new posts from the Fellowship.
        </p>
        <Link
          href="/?subscribe=1"
          className="inline-flex items-center justify-center w-full px-4 py-2 rounded-full bg-[var(--ff-gold)] text-[var(--ff-blue)] text-xs font-bold uppercase tracking-[0.14em] hover:brightness-110 transition"
        >
          Subscribe
        </Link>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="rounded-[16px] bg-white border border-[var(--line)] shadow-card p-5">
          <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft,#3E4E5A)] mb-4">
            <BookOpen className="size-3.5" />
            Related by topic
          </h3>
          <ul className="space-y-4">
            {related.map((item) => {
              const isPost = item.kind === "post";
              const data = item.data;
              const href = isPost
                ? `/${(item as { blogSlug: string }).blogSlug}/${data.slug}`
                : `/devotionals/${data.slug}`;
              const img = isPost
                ? (item.data as PostWithTags).hero_image_url
                : (item.data as DevotionalWithTags).image_url;
              const date = data.published_at
                ? format(new Date(data.published_at), "MMM d, yyyy")
                : null;
              return (
                <li key={`${item.kind}-${data.id}`}>
                  <Link href={href} className="group flex gap-3 items-start">
                    {img ? (
                      <div className="relative w-16 h-16 shrink-0 rounded-[10px] overflow-hidden bg-[var(--cream-200)]">
                        <Image
                          src={img}
                          alt={data.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 shrink-0 rounded-[10px] bg-[var(--ff-blue)] flex items-center justify-center">
                        <BookOpen className="size-5 text-[var(--ff-gold)]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      {date && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-text,#6E7882)] mb-0.5">
                          {date}
                        </p>
                      )}
                      <p className="font-display text-[15px] leading-tight text-[var(--ink)] group-hover:text-[var(--ff-blue)] transition-colors line-clamp-2">
                        {data.title}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </aside>
  );
}
