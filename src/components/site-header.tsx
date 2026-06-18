"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SubscribeForm from "@/components/subscribe-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const NAV = [
  { href: "/",                      label: "Home" },
  { href: "/about",                  label: "About" },
  { href: "/fishermans-fellowship",  label: "Fisherman's Fellowship" },
  { href: "/rise-up-gods-way",       label: "Rise Up God's Way" },
  { href: "/devotionals",            label: "Devotionals" },
  { href: "/events",                 label: "Events" },
  { href: "/contact",                label: "Contact" },
];

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[13px] font-semibold tracking-[0.04em] transition-colors duration-200 ${
        active
          ? "bg-white text-[var(--ff-blue)] shadow-sm"
          : "text-[var(--ff-blue)] hover:bg-white hover:text-[var(--ff-blue)]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(251,248,242,0.85)",
        WebkitBackdropFilter: "blur(8px)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--line, rgba(36,55,70,.08))",
      }}
    >
      <div className="max-w-content mx-auto px-5 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" aria-label="Fisherman's Fellowship — Home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/ff-wordmark.svg"
            alt="Fisherman's Fellowship"
            width={180}
            height={40}
            className="h-9 w-auto"
            style={{ color: "var(--ff-blue)", ["--ff-accent" as string]: "var(--ff-gold)" } as React.CSSProperties}
          />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-1 bg-[var(--cream-200,#ECE2D4)] rounded-full px-2 py-1.5"
        >
          {NAV.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} />
          ))}
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
          <SheetContent side="right" className="w-72 bg-[var(--paper)] pt-12">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV.map((n) => (
                <NavLink
                  key={n.href}
                  href={n.href}
                  label={n.label}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--muted)] mb-3">
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
      <DialogTrigger
        className="ml-1 px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[var(--ff-gold)] text-[var(--ff-blue)] hover:bg-[var(--gold-700)] transition-colors duration-200 cursor-pointer"
      >
        Subscribe
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-[var(--ff-blue)]">
            Get the Daily Devotional
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[var(--muted)] mt-1 mb-4">
          A free daily word to keep you in Scripture and growing — right where you are.
        </p>
        <SubscribeForm />
      </DialogContent>
    </Dialog>
  );
}
