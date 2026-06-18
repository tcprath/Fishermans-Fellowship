"use client";

import { useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, ExternalLink } from "lucide-react";

const IG_URL = "https://www.instagram.com/fish_fellowship/";
const FB_URL = "https://www.facebook.com/fishermansfellowshipministries";

// ── Brand SVGs ──────────────────────────────────────────────────────────────
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ── Placeholder posts ────────────────────────────────────────────────────────
// Replace with real API data (e.g. Behold.io) when credentials are ready
const IG_POSTS = [
  {
    id: "ig1",
    caption: "Early morning on the water — this is where the Word meets the waves. Matthew 4:19 🎣",
    likes: 84,
    comments: 12,
    timestamp: "2 days ago",
    image: "/photos/fellowship-pic.jpg",
  },
  {
    id: "ig2",
    caption: "Today's devotional hits different when you're watching the sun come up over the lake. Get the daily word — link in bio.",
    likes: 67,
    comments: 8,
    timestamp: "6 days ago",
    image: "/photos/hero-fisherman-blue.jpg",
  },
  {
    id: "ig3",
    caption: "Brotherhood isn't built on good days alone. It's built in the grind, the early mornings, and the honest conversations.",
    likes: 143,
    comments: 31,
    timestamp: "1 week ago",
    image: "/photos/section-dock.jpg",
  },
  {
    id: "ig4",
    caption: "Tournament season is here. Come find us at the weigh-in — sharing the Gospel and good conversation. See you on the water.",
    likes: 95,
    comments: 17,
    timestamp: "1 week ago",
    image: "/photos/fellowship-pic.jpg",
  },
  {
    id: "ig5",
    caption: "\"Follow me, and I will make you fishers of men.\" — Matthew 4:19. That call hasn't changed. Neither have we.",
    likes: 201,
    comments: 44,
    timestamp: "2 weeks ago",
    image: "/photos/hero-fisherman-blue.jpg",
  },
  {
    id: "ig6",
    caption: "New series dropping Monday. If you've ever felt like faith and fishing don't mix — this one's for you.",
    likes: 118,
    comments: 22,
    timestamp: "2 weeks ago",
    image: "/photos/section-dock.jpg",
  },
];

const FB_POSTS = [
  {
    id: "fb1",
    caption: "What a weekend retreat. 14 men, 3 days, and a whole lot of truth spoken around the fire. Fellowship runs deep when you build it on the Word.",
    likes: 112,
    comments: 23,
    timestamp: "4 days ago",
  },
  {
    id: "fb2",
    caption: "New devotional series starting Monday — \"Fishers of Men: Walking Out Matthew 4:19 Daily.\" Free. No signup needed. Just the Word.",
    likes: 78,
    comments: 14,
    timestamp: "1 week ago",
  },
  {
    id: "fb3",
    caption: "We are 100% volunteer-led. Every leader covers their own expenses to bring the Gospel to the fishing community. If you want to support the mission, link below.",
    likes: 134,
    comments: 29,
    timestamp: "1 week ago",
  },
  {
    id: "fb4",
    caption: "Upcoming tournament in Dayton, TN next weekend. Come find the Fisherman's Fellowship booth — we'd love to meet you.",
    likes: 89,
    comments: 18,
    timestamp: "10 days ago",
  },
  {
    id: "fb5",
    caption: "Fisherman's Fellowship is a 501(c)(3) ministry. All donations go directly to the mission. Thank you for your support and prayers.",
    likes: 156,
    comments: 37,
    timestamp: "2 weeks ago",
  },
  {
    id: "fb6",
    caption: "Mentorship isn't a program — it's a commitment. We're looking for men who want to walk alongside younger fishermen in faith and life.",
    likes: 103,
    comments: 26,
    timestamp: "3 weeks ago",
  },
];

type Post = { id: string; caption: string; likes: number; comments: number; timestamp: string; image?: string };
type Platform = "instagram" | "facebook";

// ── Carousel instance — keyed so Embla reinitializes on tab switch ──────────
function FeedCarousel({ posts, platform }: { posts: Post[]; platform: Platform }) {
  const isIG = platform === "instagram";
  const profileUrl = isIG ? IG_URL : FB_URL;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    loop: false,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div>
      {/* Carousel + nav row */}
      <div className="flex items-center gap-3 mb-5 justify-end">
        <button
          onClick={scrollPrev}
          aria-label="Previous"
          className="w-9 h-9 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-soft)] hover:border-[var(--ff-blue)] hover:text-[var(--ff-blue)] hover:bg-[var(--cream-200)] transition-all duration-200 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={scrollNext}
          aria-label="Next"
          className="w-9 h-9 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-soft)] hover:border-[var(--ff-blue)] hover:text-[var(--ff-blue)] hover:bg-[var(--cream-200)] transition-all duration-200 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5" style={{ touchAction: "pan-y" }}>
          {posts.map((post) => (
            <div key={post.id} className="shrink-0 w-[300px] sm:w-[320px]" style={{ minWidth: 0 }}>
              <div className="bg-white rounded-[20px] border border-[var(--line)] shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(.32,.72,0,1)] flex flex-col overflow-hidden h-full">
                {/* Card header — photo for IG posts, gradient for FB */}
                {isIG && post.image ? (
                  <div className="relative h-44 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.32) 100%)" }}
                    />
                    <div
                      className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
                    >
                      <InstagramIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="h-44 flex items-center justify-center shrink-0"
                    style={{
                      background: isIG
                        ? "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)"
                        : "linear-gradient(135deg, #1877f2 0%, #0d5cbf 100%)",
                    }}
                  >
                    {isIG ? (
                      <InstagramIcon className="h-10 w-10 text-white opacity-30" />
                    ) : (
                      <FacebookIcon className="h-10 w-10 text-white opacity-30" />
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: isIG
                          ? "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)"
                          : "#1877f2",
                      }}
                    >
                      {isIG ? (
                        <InstagramIcon className="h-3 w-3 text-white" />
                      ) : (
                        <FacebookIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="text-[12px] font-semibold text-[var(--ink-soft)]">
                      {isIG ? "@fish_fellowship" : "Fisherman's Fellowship Ministries"}
                    </span>
                    <span className="ml-auto text-[11px] text-[var(--muted-text)] shrink-0">
                      {post.timestamp}
                    </span>
                  </div>

                  <p className="text-[14px] text-[var(--ink-soft)] leading-relaxed flex-1 line-clamp-4">
                    {post.caption}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--line-soft)]">
                    <div className="flex items-center gap-4 text-[12px] text-[var(--muted-text)]">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {post.comments}
                      </span>
                    </div>
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[12px] font-semibold text-[var(--ff-blue)] hover:text-[var(--ff-gold)] transition-colors duration-200"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main section ─────────────────────────────────────────────────────────────
export default function SocialFeed() {
  const [active, setActive] = useState<Platform>("instagram");

  return (
    <section className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 py-24">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-2">
            <span className="inline-flex items-center gap-1.5">
              <InstagramIcon className="h-3 w-3 text-[var(--ff-gold)]" />
              <FacebookIcon className="h-3 w-3 text-[var(--ff-gold)]" />
            </span>
            Follow Along
          </p>
          <h2
            className="font-display text-[var(--ink)] leading-tight"
            style={{ fontSize: "clamp(24px, 3.5vw, 38px)" }}
          >
            From the Community
          </h2>
        </div>

        {/* Platform toggle */}
        <div className="flex items-center gap-1.5 bg-[var(--cream-200)] rounded-full p-1.5 self-start sm:self-auto">
          <button
            onClick={() => setActive("instagram")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
              active === "instagram"
                ? "bg-white text-[var(--ff-blue)] shadow-sm"
                : "text-[var(--ink-soft)] hover:text-[var(--ff-blue)]"
            }`}
          >
            <InstagramIcon className="h-3.5 w-3.5" />
            Instagram
          </button>
          <button
            onClick={() => setActive("facebook")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
              active === "facebook"
                ? "bg-white text-[var(--ff-blue)] shadow-sm"
                : "text-[var(--ink-soft)] hover:text-[var(--ff-blue)]"
            }`}
          >
            <FacebookIcon className="h-3.5 w-3.5" />
            Facebook
          </button>
        </div>
      </div>

      {/* Carousel — key forces Embla reinit on tab switch */}
      <FeedCarousel key={active} posts={active === "instagram" ? IG_POSTS : FB_POSTS} platform={active} />

      {/* Follow link */}
      <div className="mt-6">
        <a
          href={active === "instagram" ? IG_URL : FB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--ff-blue)] hover:text-[var(--ff-gold)] transition-colors duration-200"
        >
          {active === "instagram" ? (
            <><InstagramIcon className="h-3.5 w-3.5" /> Follow @fish_fellowship on Instagram</>
          ) : (
            <><FacebookIcon className="h-3.5 w-3.5" /> Follow on Facebook</>
          )}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
