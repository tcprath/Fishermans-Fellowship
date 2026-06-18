"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { upsertEvent, deleteEvent } from "@/app/(admin)/admin/events/actions";
import type { EventRow } from "@/lib/supabase/types";
import { Trash2 } from "lucide-react";

interface EventFormProps {
  event?: EventRow;
}

const SITE_TZ = process.env.NEXT_PUBLIC_SITE_TZ ?? "America/New_York";

function utcToInputValue(utcString: string, allDay: boolean): string {
  const zoned = toZonedTime(new Date(utcString), SITE_TZ);
  if (allDay) return format(zoned, "yyyy-MM-dd");
  return format(zoned, "yyyy-MM-dd'T'HH:mm");
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const isNew = !event;

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [startsAt, setStartsAt] = useState(
    event ? utcToInputValue(event.starts_at, event.all_day) : ""
  );
  const [endsAt, setEndsAt] = useState(
    event ? utcToInputValue(event.ends_at, event.all_day) : ""
  );
  const [status, setStatus] = useState<"draft" | "published">(
    event?.status ?? "published"
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAllDayChange(checked: boolean) {
    setAllDay(checked);
    // Strip time portion if switching to all-day
    if (checked) {
      setStartsAt(startsAt.slice(0, 10));
      setEndsAt(endsAt.slice(0, 10));
    } else {
      // Add default time if switching away from all-day
      if (startsAt.length === 10) setStartsAt(`${startsAt}T09:00`);
      if (endsAt.length === 10) setEndsAt(`${endsAt}T10:00`);
    }
  }

  async function handleSave(newStatus?: "draft" | "published") {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!startsAt) { toast.error("Start date/time is required"); return; }
    if (!endsAt) { toast.error("End date/time is required"); return; }

    const saveStatus = newStatus ?? status;

    startTransition(async () => {
      const result = await upsertEvent({
        id: event?.id,
        title,
        description: description || undefined,
        location: location || undefined,
        starts_at: startsAt,
        ends_at: endsAt,
        all_day: allDay,
        status: saveStatus,
      });

      if (!result.success) { toast.error(result.error); return; }

      setStatus(saveStatus);
      toast.success(saveStatus === "published" ? "Event published!" : "Draft saved");
      if (isNew) router.push(`/admin/events/${result.id}`);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      if (!event?.id) return;
      const result = await deleteEvent(event.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Event deleted");
      router.push("/admin/events");
    });
  }

  const isPublished = status === "published";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? "New event" : title || "Edit event"}
          </h1>
          {!isNew && (
            <div className="mt-1">
              <Badge variant={isPublished ? "default" : "secondary"}>
                {isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isPublished && (
            <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleSave("draft")}>
              Unpublish
            </Button>
          )}
          <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleSave("draft")}>
            Save draft
          </Button>
          {!isPublished ? (
            <Button size="sm" disabled={isPending} onClick={() => handleSave("published")}>
              Publish
            </Button>
          ) : (
            <Button size="sm" disabled={isPending} onClick={() => handleSave("published")}>
              Save
            </Button>
          )}
          {!isNew && (
            <>
              <Button
                variant="destructive"
                size="icon"
                disabled={isPending}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete event?</DialogTitle>
                  <DialogDescription>
                    This permanently deletes &ldquo;{event.title}&rdquo; and cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isPending}>Delete</Button>
                </DialogFooter>
              </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue or address" />
          </div>
        </div>

        {/* Sidebar — date/time */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="all-day"
                type="checkbox"
                checked={allDay}
                onChange={(e) => handleAllDayChange(e.target.checked)}
                className="size-4 rounded border-border accent-[#243746]"
              />
              <label htmlFor="all-day" className="text-sm font-medium cursor-pointer">
                All-day event
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Start {!allDay && <span className="text-xs text-muted-foreground font-normal">({SITE_TZ})</span>}
              </label>
              {allDay ? (
                <Input
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                />
              ) : (
                <Input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                End {!allDay && <span className="text-xs text-muted-foreground font-normal">({SITE_TZ})</span>}
              </label>
              {allDay ? (
                <Input
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  required
                />
              ) : (
                <Input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  required
                />
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Times are interpreted in {SITE_TZ}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
