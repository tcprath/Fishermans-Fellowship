"use client";

import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import type { EventClickArg } from "@fullcalendar/core";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddToCalendar from "@/components/add-to-calendar";
import type { EventRow } from "@/lib/supabase/types";

type Props = { events: EventRow[] };

export default function EventsCalendar({ events }: Props) {
  const [selected, setSelected] = useState<EventRow | null>(null);

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.starts_at,
    end: e.ends_at,
    allDay: e.all_day,
  }));

  function handleClick(arg: EventClickArg) {
    const ev = events.find((e) => e.id === arg.event.id);
    if (ev) setSelected(ev);
  }

  return (
    <>
      <div className="fc-brand">
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listMonth",
          }}
          events={fcEvents}
          eventClick={handleClick}
          height="auto"
          buttonText={{ today: "Today", month: "Month", list: "List" }}
        />
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-[var(--ff-blue)] text-2xl leading-tight">
                {selected.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-[var(--ink-soft)]">
              <p>
                <span className="font-semibold text-[var(--ink)]">When: </span>
                {selected.all_day
                  ? format(new Date(selected.starts_at), "EEEE, MMMM d, yyyy")
                  : `${format(new Date(selected.starts_at), "EEEE, MMMM d, yyyy · h:mm a")} – ${format(new Date(selected.ends_at), "h:mm a")}`}
              </p>
              {selected.location && (
                <p>
                  <span className="font-semibold text-[var(--ink)]">Where: </span>
                  {selected.location}
                </p>
              )}
              {selected.description && (
                <p className="leading-relaxed">{selected.description}</p>
              )}
            </div>
            <div className="mt-4">
              <AddToCalendar event={selected} />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
