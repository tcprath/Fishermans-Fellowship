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
import ResourceRowActions from "@/components/admin/resource-row-actions";
import { Plus, Star } from "lucide-react";
import { format } from "date-fns";
import type { ResourceRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Resources" };

export const revalidate = 0;

const TYPE_LABELS: Record<string, string> = {
  book: "Book",
  video: "Video",
  podcast: "Podcast",
  study: "Study",
  article: "Article",
  link: "Link",
};

export default async function ResourcesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("resources").select("*").order("updated_at", { ascending: false });
  if (sp.type)   query = query.eq("type", sp.type);
  if (sp.status) query = query.eq("status", sp.status);
  if (sp.q)      query = query.ilike("title", `%${sp.q}%`);

  const { data: resources } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resources</h1>
        <Link href="/admin/resources/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="size-4" />
          New resource
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterLink href="/admin/resources" active={!sp.type && !sp.status} label="All" />
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <FilterLink
            key={value}
            href={`/admin/resources?type=${value}`}
            active={sp.type === value}
            label={label}
          />
        ))}
        <div className="w-px bg-border self-stretch mx-1" />
        <FilterLink href="/admin/resources?status=published" active={sp.status === "published"} label="Published" />
        <FilterLink href="/admin/resources?status=draft" active={sp.status === "draft"} label="Drafts" />
      </div>

      {resources && resources.length > 0 ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(resources as ResourceRow[]).map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link
                      href={`/admin/resources/${r.id}`}
                      className="font-medium hover:text-primary transition-colors inline-flex items-center gap-2"
                    >
                      {r.title || <span className="text-muted-foreground italic">Untitled</span>}
                      {r.featured && (
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {TYPE_LABELS[r.type] ?? r.type}
                  </TableCell>
                  <TableCell>
                    {r.status === "published" && r.publish_at && new Date(r.publish_at) > new Date() ? (
                      <Badge variant="outline">Scheduled</Badge>
                    ) : (
                      <Badge variant={r.status === "published" ? "default" : "secondary"}>
                        {r.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(r.updated_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <ResourceRowActions resource={r} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <p className="font-medium">No resources yet</p>
          <p className="text-sm mt-1">Add your first resource to get started.</p>
        </div>
      )}
    </div>
  );
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
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
