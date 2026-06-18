import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DevotionalRowActions from "@/components/admin/devotional-row-actions";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import type { DevotionalRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Devotionals" };

export const revalidate = 0;

export default async function DevotionalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("devotionals")
    .select("*")
    .order("updated_at", { ascending: false });

  if (sp.status) query = query.eq("status", sp.status);

  const { data: devotionals } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Devotionals</h1>
        <Link href="/admin/devotionals/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="size-4" />
          New devotional
        </Link>
      </div>

      <div className="flex gap-2">
        <FilterLink href="/admin/devotionals" active={!sp.status} label="All" />
        <FilterLink href="/admin/devotionals?status=published" active={sp.status === "published"} label="Published" />
        <FilterLink href="/admin/devotionals?status=draft" active={sp.status === "draft"} label="Drafts" />
      </div>

      {devotionals && devotionals.length > 0 ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Scripture</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {devotionals.map((d: DevotionalRow) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link
                      href={`/admin/devotionals/${d.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {d.title || <span className="text-muted-foreground italic">Untitled</span>}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {d.scripture ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={d.status === "published" ? "default" : "secondary"}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(d.updated_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DevotionalRowActions devotional={d} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <p className="font-medium">No devotionals yet</p>
          <p className="text-sm mt-1">Create your first devotional to get started.</p>
        </div>
      )}
    </div>
  );
}

function FilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
