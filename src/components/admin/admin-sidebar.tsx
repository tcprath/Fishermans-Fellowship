"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(admin)/admin/auth-actions";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Calendar,
  Fish,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", icon: FileText, exact: false },
  { href: "/admin/devotionals", label: "Devotionals", icon: BookOpen, exact: false },
  { href: "/admin/events", label: "Events", icon: Calendar, exact: false },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-[#243746] text-white flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Fish className="size-5 text-[#BD9A5F] shrink-0" />
          <span className="font-semibold text-sm leading-tight">Ministry Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white/12 text-white font-medium"
                  : "text-white/55 hover:text-white hover:bg-white/6"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <p className="text-xs text-white/35 truncate px-1">{email}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/55 hover:text-white hover:bg-white/6 transition-colors"
          >
            <LogOut className="size-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
