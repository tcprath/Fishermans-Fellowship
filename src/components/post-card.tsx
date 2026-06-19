import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import type { PostRow, TagRow } from "@/lib/supabase/types";
import TagChips from "@/components/tag-chips";

type Props = {
  post: PostRow & { tags?: TagRow[] };
  blogSlug: string;
};

export default function PostCard({ post, blogSlug }: Props) {
  const href = `/${blogSlug}/${post.slug}`;
  const date = post.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : null;

  return (
    <article className="group flex flex-col bg-white border border-[var(--line)] rounded-[20px] overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(.32,.72,0,1)]">
      {post.hero_image_url && (
        <Link href={href} tabIndex={-1} aria-hidden>
          <div className="relative aspect-[16/9] bg-[var(--cream-200)] overflow-hidden">
            <Image
              src={post.hero_image_url}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(.32,.72,0,1)] group-hover:scale-[1.03]"
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            />
          </div>
        </Link>
      )}
      <div className="flex flex-col flex-1 p-6">
        {date && (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted-text,#6E7882)] mb-2">
            {date}
          </p>
        )}
        <h3 className="font-display text-xl text-[var(--ink)] leading-snug mb-2 group-hover:text-[var(--ff-blue)] transition-colors duration-200">
          <Link href={href}>{post.title}</Link>
        </h3>
        {post.excerpt && (
          <p className="text-sm text-[var(--ink-soft,#3E4E5A)] leading-relaxed line-clamp-3 mb-4 flex-1">
            {post.excerpt}
          </p>
        )}
        {post.tags && post.tags.length > 0 && (
          <TagChips tags={post.tags} basePath={`/${blogSlug}`} className="mb-3" />
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          {post.author && (
            <p className="text-xs text-[var(--muted-text,#6E7882)]">By {post.author}</p>
          )}
          <Link
            href={href}
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[var(--ff-blue)] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-hidden
            tabIndex={-1}
          >
            Read <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
