import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen, Calendar, Plus, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import type { PostRow, DevotionalRow, EventRow, BlogRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Dashboard" };

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: totalDevotionals },
    { count: publishedDevotionals },
    { count: upcomingEvents },
    { data: recentPosts },
    { data: recentDevotionals },
    { data: nextEvents },
  ] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("devotionals").select("*", { count: "exact", head: true }),
    supabase.from("devotionals").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("events").select("*", { count: "exact", head: true }).gte("starts_at", new Date().toISOString()).eq("status", "published"),
    supabase.from("posts").select("*, blogs(name)").order("updated_at", { ascending: false }).limit(5),
    supabase.from("devotionals").select("*").order("updated_at", { ascending: false }).limit(5),
    supabase.from("events").select("*").gte("starts_at", new Date().toISOString()).eq("status", "published").order("starts_at", { ascending: true }).limit(3),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={<FileText className="size-5 text-primary" />}
          label="Posts"
          value={publishedPosts ?? 0}
          sub={`${totalPosts ?? 0} total`}
          href="/admin/posts"
        />
        <StatCard
          icon={<BookOpen className="size-5 text-primary" />}
          label="Devotionals"
          value={publishedDevotionals ?? 0}
          sub={`${totalDevotionals ?? 0} total`}
          href="/admin/devotionals"
        />
        <StatCard
          icon={<Calendar className="size-5 text-primary" />}
          label="Upcoming events"
          value={upcomingEvents ?? 0}
          sub="published"
          href="/admin/events"
        />
      </div>

      {/* Quick create */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/posts/new" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <Plus className="size-4" />
          New post
        </Link>
        <Link href="/admin/devotionals/new" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <Plus className="size-4" />
          New devotional
        </Link>
        <Link href="/admin/events/new" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <Plus className="size-4" />
          New event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent posts */}
        <div className="bg-white rounded-xl border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Recent posts</h2>
            <Link href="/admin/posts" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              All <ArrowRight className="size-3" />
            </Link>
          </div>
          {recentPosts && recentPosts.length > 0 ? (
            <ul className="space-y-2">
              {recentPosts.map((p: PostRow & { blogs?: BlogRow | null }) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/posts/${p.id}`}
                    className="flex items-start justify-between gap-2 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {p.title || <span className="italic text-muted-foreground">Untitled</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(p.blogs as BlogRow | null)?.name} · {format(new Date(p.updated_at), "MMM d")}
                      </p>
                    </div>
                    <Badge variant={p.status === "published" ? "default" : "secondary"} className="shrink-0 text-xs">
                      {p.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          )}
        </div>

        {/* Recent devotionals */}
        <div className="bg-white rounded-xl border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Recent devotionals</h2>
            <Link href="/admin/devotionals" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              All <ArrowRight className="size-3" />
            </Link>
          </div>
          {recentDevotionals && recentDevotionals.length > 0 ? (
            <ul className="space-y-2">
              {recentDevotionals.map((d: DevotionalRow) => (
                <li key={d.id}>
                  <Link
                    href={`/admin/devotionals/${d.id}`}
                    className="flex items-start justify-between gap-2 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {d.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.scripture ? `${d.scripture} · ` : ""}
                        {format(new Date(d.updated_at), "MMM d")}
                      </p>
                    </div>
                    <Badge variant={d.status === "published" ? "default" : "secondary"} className="shrink-0 text-xs">
                      {d.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No devotionals yet.</p>
          )}
        </div>
      </div>

      {/* Upcoming events */}
      {nextEvents && nextEvents.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Next events</h2>
            <Link href="/admin/events" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              All <ArrowRight className="size-3" />
            </Link>
          </div>
          <ul className="space-y-2">
            {nextEvents.map((e: EventRow) => (
              <li key={e.id}>
                <Link href={`/admin/events/${e.id}`} className="flex items-start justify-between gap-2 group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {e.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {e.all_day
                        ? format(new Date(e.starts_at), "MMM d, yyyy")
                        : format(new Date(e.starts_at), "MMM d, yyyy · h:mm a")}
                      {e.location ? ` · ${e.location}` : ""}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-border p-5 flex items-start gap-4 hover:border-ring transition-colors group"
    >
      <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-sm font-medium mt-1 group-hover:text-primary transition-colors">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </Link>
  );
}
