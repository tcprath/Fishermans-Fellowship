"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X, ArrowUpRight, Heart, Mail } from "lucide-react";
import SubscribeForm from "@/components/subscribe-form";
import { Sparkle } from "@/components/ui/sparkle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const NAV = [
  { href: "/",                      label: "Home" },
  { href: "/about",                  label: "About" },
  { href: "/fishermans-fellowship",  label: "Blog" },
  { href: "/rise-up-gods-way",       label: "Rise Up God's Way" },
  { href: "/devotionals",            label: "Devotionals" },
  { href: "/events",                 label: "Events" },
  { href: "/resources",              label: "Resources" },
  { href: "/contact",                label: "Contact" },
];

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold tracking-[0.02em] transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-white text-[var(--ff-blue)] shadow-sm"
          : "text-[var(--blue-700,#33485A)] hover:bg-white/70 hover:text-[var(--ff-blue)]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full ${scrolled ? "header-scrolled" : ""}`}
      style={{
        background: "rgba(251,248,242,0.88)",
        WebkitBackdropFilter: "blur(12px)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--line-soft, rgba(36,55,70,.08))",
        height: scrolled ? "60px" : "90px",
        transition: "height 0.45s cubic-bezier(.32,.72,0,1), box-shadow 0.3s cubic-bezier(.32,.72,0,1)",
      }}
    >
      <div className="max-w-[var(--max-w-content,1140px)] mx-auto px-5 h-full flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Fisherman's Fellowship — Home"
          className="shrink-0 hover:opacity-80"
          style={{ transition: "opacity 0.2s" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/ff-wordmark.svg"
            alt="Fisherman's Fellowship"
            width={168}
            height={38}
            style={{
              height: scrolled ? "32px" : "46px",
              width: "auto",
              transition: "height 0.45s cubic-bezier(.32,.72,0,1)",
              color: "var(--ff-blue)",
              "--ff-accent": "var(--ff-gold)",
            } as React.CSSProperties}
          />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-0.5 bg-[var(--cream-200,#ECE2D4)] rounded-full px-1.5 py-1"
        >
          {NAV.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} />
          ))}
          <Link
            href="/donate"
            className="ml-0.5 px-4 py-1.5 rounded-full text-[12.5px] font-bold bg-[var(--ff-blue)] text-[var(--ff-cream)] hover:bg-[var(--blue-800,#1a2b38)] transition-colors duration-200 whitespace-nowrap"
          >
            Donate
          </Link>
          <SubscribeDialog />
        </nav>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-full hover:bg-[var(--cream-200)] transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-[var(--ff-blue)]" />
        </button>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock body scroll while menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const content = (
    <div
      className={`lg:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop layers */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #243746 0%, #1F2F3D 60%, #1A2A38 100%)",
        }}
      />
      {/* Decorative gold glow */}
      <div
        className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(189,154,95,0.22) 0%, transparent 65%)",
        }}
        aria-hidden
      />
      {/* Subtle grain noise */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      {/* Content scroll container */}
      <div
        className={`relative h-full w-full overflow-y-auto flex flex-col text-[var(--ff-cream)] transition-transform duration-500 ease-[cubic-bezier(.32,.72,0,1)] ${
          open ? "translate-y-0" : "translate-y-3"
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <Link
            href="/"
            aria-label="Home"
            onClick={onClose}
            className="inline-flex items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/ff-white.svg"
              alt="Fisherman's Fellowship"
              className="h-10 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 rounded-full border border-[rgba(244,237,229,0.18)] flex items-center justify-center text-[var(--ff-cream)] hover:bg-[rgba(244,237,229,0.08)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Eyebrow */}
        <div className="px-5 mt-4">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ff-gold)]">
            <Sparkle size={10} className="text-[var(--ff-gold)]" />
            Navigate
          </p>
        </div>

        {/* Big nav links */}
        <nav
          aria-label="Mobile navigation"
          className="px-5 mt-3 flex-1"
        >
          <ul className="divide-y divide-[rgba(244,237,229,0.04)]">
            {NAV.map((n, i) => {
              const active =
                pathname === n.href ||
                (n.href !== "/" && pathname.startsWith(n.href));
              return (
                <li
                  key={n.href}
                  className={`transition-all duration-500 ease-[cubic-bezier(.32,.72,0,1)] ${
                    open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
                >
                  <Link
                    href={n.href}
                    onClick={onClose}
                    className="group flex items-center justify-between py-4"
                  >
                    <span className="flex items-baseline gap-3">
                      <span
                        className={`font-mono text-[10px] tracking-widest pt-1 ${
                          active
                            ? "text-[var(--ff-gold)]"
                            : "text-[var(--blue-500,#5A6E7E)]"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display leading-none transition-colors ${
                          active
                            ? "text-[var(--ff-gold)]"
                            : "text-[var(--ff-cream)] group-hover:text-[var(--ff-gold)]"
                        }`}
                        style={{ fontSize: "clamp(16px, 4.5vw, 22px)" }}
                      >
                        {n.label}
                      </span>
                    </span>
                    <ArrowUpRight
                      className={`h-5 w-5 transition-all duration-300 ${
                        active
                          ? "text-[var(--ff-gold)] opacity-100 translate-x-0"
                          : "text-[var(--blue-300,#9FAEBA)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* CTA buttons */}
        <div
          className={`px-5 mt-8 grid grid-cols-2 gap-3 transition-all duration-500 ease-out ${
            open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          style={{ transitionDelay: open ? "500ms" : "0ms" }}
        >
          <Link
            href="/donate"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[var(--ff-gold)] text-[var(--ff-blue)] text-sm font-bold shadow-[0_8px_24px_-6px_rgba(189,154,95,0.6),0_0_0_1px_rgba(0,0,0,0.08)] ring-1 ring-[#5C4623] hover:brightness-110 transition"
          >
            <Heart className="h-4 w-4" strokeWidth={2.25} />
            Donate
          </Link>
          <Link
            href="/?subscribe=1"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border border-[rgba(244,237,229,0.3)] text-[var(--ff-cream)] text-sm font-bold hover:bg-[rgba(244,237,229,0.08)] transition"
          >
            <Mail className="h-4 w-4" />
            Subscribe
          </Link>
        </div>

        {/* Footer */}
        <div
          className={`px-5 mt-8 pb-10 pt-6 border-t border-[rgba(244,237,229,0.04)] transition-all duration-500 ease-out ${
            open ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: open ? "600ms" : "0ms" }}
        >
          <p className="font-serif italic text-[var(--blue-300,#9FAEBA)] text-lg leading-snug mb-5">
            &ldquo;Follow me, and I will make you fishers of men.&rdquo;
            <span className="block not-italic text-xs text-[var(--blue-500,#5A6E7E)] tracking-wide mt-1.5">
              — Matthew 4:19
            </span>
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/fish_fellowship/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-[rgba(189,154,95,0.14)] hover:bg-[rgba(189,154,95,0.28)] flex items-center justify-center transition-colors text-[var(--ff-gold)]"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/fishermansfellowshipministries"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 rounded-full bg-[rgba(189,154,95,0.14)] hover:bg-[rgba(189,154,95,0.28)] flex items-center justify-center transition-colors text-[var(--ff-gold)]"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <span className="ml-auto text-[10px] uppercase tracking-[0.24em] text-[var(--blue-500,#5A6E7E)] text-right leading-tight">
              © {new Date().getFullYear()}
              <span className="block text-[var(--blue-300,#9FAEBA)]">
                Fisherman&apos;s Fellowship
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

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

function SubscribeDialog() {
  return (
    <Dialog>
      <DialogTrigger className="ml-1 px-4 py-1.5 rounded-full text-[12.5px] font-bold bg-[var(--ff-gold)] text-[var(--ff-blue)] hover:bg-[var(--gold-700,#A8854B)] transition-colors duration-200 cursor-pointer whitespace-nowrap">
        Subscribe
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-[var(--ff-blue)]">
            Get the Daily Devotional
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[var(--muted-text,#6E7882)] mt-1 mb-4 leading-relaxed">
          A free daily word to keep you in Scripture and growing — right where you are.
        </p>
        <SubscribeForm />
      </DialogContent>
    </Dialog>
  );
}
