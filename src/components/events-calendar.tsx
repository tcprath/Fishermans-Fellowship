"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import type { EventClickArg, EventMountArg } from "@fullcalendar/core";
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

type HoverState = { event: EventRow; x: number; y: number } | null;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function EventsCalendar({ events }: Props) {
  const [selected, setSelected] = useState<EventRow | null>(null);
  const [hover, setHover] = useState<HoverState>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.starts_at,
    end: e.ends_at,
    allDay: e.all_day,
  }));

  function findEvent(id: string) {
    return events.find((e) => e.id === id) ?? null;
  }

  function handleClick(arg: EventClickArg) {
    const ev = findEvent(arg.event.id);
    if (ev) setSelected(ev);
  }

  function handleMouseEnter(arg: { event: { id: string }; el: HTMLElement }) {
    const ev = findEvent(arg.event.id);
    if (!ev) return;
    const rect = arg.el.getBoundingClientRect();
    setHover({
      event: ev,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }

  function handleMouseLeave() {
    setHover(null);
  }

  function handleEventDidMount(info: EventMountArg) {
    if (info.view.type !== "listMonth") return;
    const ev = findEvent(info.event.id);
    if (!ev) return;
    const titleCell = info.el.querySelector(".fc-list-event-title");
    if (!titleCell) return;
    if (titleCell.querySelector(".fc-list-event-meta")) return;

    const parts: string[] = [];
    if (ev.location) {
      parts.push(
        `<span class="fc-meta-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>${escapeHtml(ev.location)}</span>`
      );
    }
    if (!ev.all_day) {
      const mins = Math.round(
        (new Date(ev.ends_at).getTime() - new Date(ev.starts_at).getTime()) / 60000
      );
      const label =
        mins >= 60
          ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}`
          : `${mins}m`;
      parts.push(
        `<span class="fc-meta-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${label}</span>`
      );
    }

    if (parts.length) {
      const meta = document.createElement("div");
      meta.className = "fc-list-event-meta";
      meta.innerHTML = parts.join("");
      titleCell.appendChild(meta);
    }

    if (ev.description) {
      const desc = document.createElement("div");
      desc.className = "fc-list-event-desc";
      desc.textContent = ev.description;
      titleCell.appendChild(desc);
    }
  }

  function formatWhen(ev: EventRow) {
    return ev.all_day
      ? format(new Date(ev.starts_at), "EEEE, MMMM d, yyyy")
      : `${format(new Date(ev.starts_at), "EEEE, MMMM d · h:mm a")} – ${format(new Date(ev.ends_at), "h:mm a")}`;
  }

  return (
    <>
      <div className="fc-brand">
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin]}
          initialView="listMonth"
          headerToolbar={
            isMobile
              ? {
                  left: "title",
                  center: "",
                  right: "prev,next today dayGridMonth,listMonth",
                }
              : {
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,listMonth",
                }
          }
          events={fcEvents}
          eventClick={handleClick}
          eventMouseEnter={handleMouseEnter}
          eventMouseLeave={handleMouseLeave}
          eventDidMount={handleEventDidMount}
          height="auto"
          buttonText={{ today: "Today", month: "Month", list: "List" }}
        />
      </div>

      {hover && (
        <div
          role="tooltip"
          className="hidden sm:block pointer-events-none fixed z-50 w-72 -translate-x-1/2 -translate-y-full rounded-xl border border-[var(--line)] bg-white p-4 shadow-xl"
          style={{ left: hover.x, top: hover.y - 8 }}
        >
          <p className="font-display text-base leading-tight text-[var(--ff-blue)]">
            {hover.event.title}
          </p>
          <p className="mt-2 text-xs text-[var(--ink-soft)]">
            {formatWhen(hover.event)}
          </p>
          {hover.event.location && (
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              <span className="font-semibold text-[var(--ink)]">Where: </span>
              {hover.event.location}
            </p>
          )}
          {hover.event.description && (
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--ink-soft)]">
              {hover.event.description}
            </p>
          )}
        </div>
      )}

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
