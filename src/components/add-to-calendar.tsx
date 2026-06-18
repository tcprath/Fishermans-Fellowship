"use client";

import { format } from "date-fns";
import { CalendarPlus, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EventRow } from "@/lib/supabase/types";

function googleCalendarUrl(event: EventRow): string {
  const fmt = (iso: string) =>
    event.all_day
      ? format(new Date(iso), "yyyyMMdd")
      : format(new Date(iso), "yyyyMMdd'T'HHmmss'Z'");

  let dates = `${fmt(event.starts_at)}/${fmt(event.ends_at)}`;

  // Google all-day end is exclusive — add one day
  if (event.all_day) {
    const end = new Date(event.ends_at);
    end.setDate(end.getDate() + 1);
    dates = `${fmt(event.starts_at)}/${format(end, "yyyyMMdd")}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates,
    ...(event.description ? { details: event.description } : {}),
    ...(event.location    ? { location: event.location }    : {}),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

type Props = { event: EventRow };

export default function AddToCalendar({ event }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--line)] text-[var(--ff-blue)] font-semibold text-sm hover:border-[var(--ff-blue)] hover:bg-[rgba(36,55,70,.04)] transition-colors cursor-pointer">
        <CalendarPlus className="h-4 w-4" />
        Add to calendar
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuItem
          onClick={() => window.open(googleCalendarUrl(event), "_blank", "noopener,noreferrer")}
          className="cursor-pointer"
        >
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const a = document.createElement("a");
            a.href = `/events/${event.id}/ics`;
            a.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
            a.click();
          }}
          className="cursor-pointer"
        >
          Apple / Outlook (.ics)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
