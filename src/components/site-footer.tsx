import Link from "next/link";

const LINKS = [
  { href: "/fishermans-fellowship", label: "Fisherman's Fellowship" },
  { href: "/rise-up-gods-way",      label: "Rise Up God's Way" },
  { href: "/devotionals",            label: "Devotionals" },
  { href: "/events",                 label: "Events" },
  { href: "/about",                  label: "About" },
  { href: "/contact",                label: "Contact" },
];

const RSS = [
  { href: "/rss.xml",                          label: "Combined feed" },
  { href: "/fishermans-fellowship/rss.xml",    label: "Fisherman's Fellowship" },
  { href: "/rise-up-gods-way/rss.xml",         label: "Rise Up God's Way" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[var(--ff-blue)] text-[var(--ff-cream)] mt-auto">
      {/* CTA band */}
      <div className="border-b border-[rgba(244,237,229,.12)]">
        <div className="max-w-content mx-auto px-5 py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-3">
              ✦ Join the Fellowship
            </p>
            <h2 className="font-display text-[clamp(28px,4vw,40px)] text-[var(--ff-cream)] leading-tight mb-4">
              You weren&apos;t made to fish alone.
            </h2>
            <p className="text-[var(--blue-300)] leading-relaxed">
              Brotherhood on the water — and beyond. Start with today&apos;s devotional
              and find your people.
            </p>
          </div>
          <Link
            href="/devotionals"
            className="inline-flex items-center gap-3 bg-[var(--ff-gold)] text-[var(--ff-blue)] hover:bg-[var(--gold-700)] transition-colors rounded-full px-6 py-3.5 font-semibold text-[15px] self-start md:self-center"
          >
            Start the Daily Devotional
          </Link>
        </div>
      </div>

      {/* Nav + RSS */}
      <div className="max-w-content mx-auto px-5 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/ff-wordmark.svg"
            alt="Fisherman's Fellowship"
            width={160}
            height={36}
            className="h-8 w-auto mb-4 [color:var(--ff-cream)] [--ff-accent:var(--ff-gold)]"
          />
          <p className="text-sm text-[var(--blue-300)] leading-relaxed">
            Fishers of men. Brothers on the water.
          </p>
        </div>

        {/* Pages */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-4">
            Pages
          </p>
          <ul className="space-y-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-[var(--blue-300)] hover:text-[var(--ff-cream)] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* RSS */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--ff-gold)] mb-4">
            RSS Feeds
          </p>
          <ul className="space-y-2">
            {RSS.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="text-sm text-[var(--blue-300)] hover:text-[var(--ff-cream)] transition-colors"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[rgba(244,237,229,.1)] max-w-content mx-auto px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[var(--blue-500)]">
        <p>© {year} Fisherman&apos;s Fellowship. All rights reserved.</p>
        <Link href="/admin/login" className="hover:text-[var(--blue-300)] transition-colors">
          Admin
        </Link>
      </div>
    </footer>
  );
}
