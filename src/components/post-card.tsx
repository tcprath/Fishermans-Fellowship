import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { PostRow } from "@/lib/supabase/types";

type Props = {
  post: PostRow;
  blogSlug: string;
};

export default function PostCard({ post, blogSlug }: Props) {
  const href = `/${blogSlug}/${post.slug}`;
  const date = post.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : null;

  return (
    <article className="group flex flex-col bg-white border border-[var(--line)] rounded-card overflow-hidden hover:-translate-y-0.5 transition-transform duration-200">
      {post.hero_image_url && (
        <Link href={href} tabIndex={-1} aria-hidden>
          <div className="relative aspect-[16/9] bg-[var(--cream-200)]">
            <Image
              src={post.hero_image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            />
          </div>
        </Link>
      )}
      <div className="flex flex-col flex-1 p-6">
        {date && (
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--muted)] mb-2">
            {date}
          </p>
        )}
        <h3 className="font-display text-xl text-[var(--ink)] leading-snug mb-2 group-hover:text-[var(--ff-blue)] transition-colors">
          <Link href={href}>{post.title}</Link>
        </h3>
        {post.excerpt && (
          <p className="text-sm text-[var(--ink-soft)] leading-relaxed line-clamp-3 mb-4 flex-1">
            {post.excerpt}
          </p>
        )}
        {post.author && (
          <p className="text-xs text-[var(--muted)] mt-auto">By {post.author}</p>
        )}
      </div>
    </article>
  );
}
