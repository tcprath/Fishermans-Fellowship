import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { getDevotionalBySlug } from "@/lib/content";
import ShareButtons from "@/components/share-buttons";

export const revalidate = 60;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const devotional = await getDevotionalBySlug(slug);
  if (!devotional) return {};
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/devotionals/${slug}`;
  return {
    title: devotional.title,
    description: devotional.excerpt ?? undefined,
    openGraph: {
      title: devotional.title,
      description: devotional.excerpt ?? undefined,
      images: [{ url: devotional.image_url, alt: devotional.title }],
      url,
    },
  };
}

export default async function DevotionalPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const devotional = await getDevotionalBySlug(slug);
  if (!devotional) notFound();

  const date = devotional.published_at
    ? format(new Date(devotional.published_at), "MMMM d, yyyy")
    : null;

  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/devotionals/${slug}`;

  return (
    <article>
      {/* Hero image */}
      <div className="relative h-80 sm:h-[28rem] overflow-hidden bg-[var(--ff-blue)]">
        <Image
          src={devotional.image_url}
          alt={devotional.title}
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(27,42,54,.4) 0%, rgba(27,42,54,.82) 100%)",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 max-w-content mx-auto px-5 pb-12">
          {date && (
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-3">
              {date}
            </p>
          )}
          {devotional.scripture && (
            <p className="font-serif italic text-[var(--gold-300)] mb-3">
              {devotional.scripture}
            </p>
          )}
          <h1
            className="font-display text-[var(--ff-cream)] leading-tight"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            {devotional.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--muted)] mb-8">
          <Link href="/devotionals" className="hover:text-[var(--ff-blue)] transition-colors">
            Devotionals
          </Link>
          <span>/</span>
          <span className="text-[var(--ink-soft)]">{devotional.title}</span>
        </nav>

        {/* Share */}
        <div className="flex justify-end mb-8">
          <div
            className="inline-flex rounded-full px-4 py-2 gap-2"
            style={{ background: "var(--ff-blue)" }}
          >
            <ShareButtons url={url} title={devotional.title} />
          </div>
        </div>

        {/* Body */}
        {devotional.body_html ? (
          <div
            className="prose prose-lg prose-headings:font-display prose-headings:text-[var(--ink)] prose-a:text-[var(--ff-blue)] prose-blockquote:border-l-[var(--ff-gold)] max-w-none"
            dangerouslySetInnerHTML={{ __html: devotional.body_html }}
          />
        ) : (
          <p className="text-[var(--muted)]">No content yet.</p>
        )}

        {/* Back */}
        <div className="mt-16 pt-8 border-t border-[var(--line)]">
          <Link
            href="/devotionals"
            className="text-sm font-semibold text-[var(--ff-blue)] hover:text-[var(--blue-700)] transition-colors"
          >
            ← Back to all devotionals
          </Link>
        </div>
      </div>
    </article>
  );
}
