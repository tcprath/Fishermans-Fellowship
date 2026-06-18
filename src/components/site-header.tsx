"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SubscribeForm from "@/components/subscribe-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const NAV = [
  { href: "/",                      label: "Home" },
  { href: "/about",                  label: "About" },
  { href: "/fishermans-fellowship",  label: "Blog" },
  { href: "/rise-up-gods-way",       label: "Rise Up God's Way" },
  { href: "/devotionals",            label: "Devotionals" },
  { href: "/events",                 label: "Events" },
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

        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="lg:hidden p-2 rounded-full hover:bg-[var(--cream-200)] transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-[var(--ff-blue)]" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-[var(--paper)] pt-10 border-l border-[var(--line)]">
            <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
              {NAV.map((n) => (
                <NavLink
                  key={n.href}
                  href={n.href}
                  label={n.label}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>
            <div className="mt-3 px-3">
              <Link
                href="/donate"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2 rounded-full text-[13px] font-bold bg-[var(--ff-blue)] text-[var(--ff-cream)] hover:bg-[var(--blue-800,#1a2b38)] transition-colors duration-200"
              >
                Donate
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-[var(--line)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--ff-gold)] mb-3">
                Stay in the Word
              </p>
              <SubscribeForm compact />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
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
