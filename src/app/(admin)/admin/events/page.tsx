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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventRowActions from "@/components/admin/event-row-actions";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import type { EventRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Events" };

export const revalidate = 0;

export default async function EventsPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .gte("starts_at", now)
      .order("starts_at", { ascending: true }),
    supabase
      .from("events")
      .select("*")
      .lt("starts_at", now)
      .order("starts_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link href="/admin/events/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="size-4" />
          New event
        </Link>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcoming?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <EventTable events={upcoming ?? []} empty="No upcoming events" />
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <EventTable events={past ?? []} empty="No past events" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EventTable({ events, empty }: { events: EventRow[]; empty: string }) {
  if (!events.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
        <p className="font-medium">{empty}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((e: EventRow) => (
            <TableRow key={e.id}>
              <TableCell>
                <Link
                  href={`/admin/events/${e.id}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {e.title}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {e.all_day
                  ? format(new Date(e.starts_at), "MMM d, yyyy")
                  : format(new Date(e.starts_at), "MMM d, yyyy h:mm a")}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {e.all_day
                  ? format(new Date(e.ends_at), "MMM d, yyyy")
                  : format(new Date(e.ends_at), "MMM d, yyyy h:mm a")}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                {e.location ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant={e.status === "published" ? "default" : "secondary"}>
                  {e.status}
                </Badge>
              </TableCell>
              <TableCell>
                <EventRowActions event={e} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
