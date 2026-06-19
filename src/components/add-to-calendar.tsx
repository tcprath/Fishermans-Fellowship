"use client";

import { format } from "date-fns";
import { CalendarPlus } from "lucide-react";
import type { EventRow } from "@/lib/supabase/types";

function googleCalendarUrl(event: EventRow): string {
  const fmt = (iso: string) =>
    event.all_day
      ? format(new Date(iso), "yyyyMMdd")
      : format(new Date(iso), "yyyyMMdd'T'HHmmss'Z'");

  let dates = `${fmt(event.starts_at)}/${fmt(event.ends_at)}`;

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
  function downloadIcs() {
    const a = document.createElement("a");
    a.href = `/events/${event.id}/ics`;
    a.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
    a.click();
  }

  return (
    <div className="border-t border-[var(--line)] pt-4">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)] mb-3">
        <CalendarPlus className="h-3.5 w-3.5" />
        Add to calendar
      </p>
      <div className="grid grid-cols-2 gap-2">
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[var(--line)] text-[var(--ff-blue)] font-semibold text-sm hover:border-[var(--ff-blue)] hover:bg-[rgba(36,55,70,.04)] transition-colors"
        >
          <GoogleIcon className="h-4 w-4" />
          Google
        </a>
        <button
          type="button"
          onClick={downloadIcs}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[var(--line)] text-[var(--ff-blue)] font-semibold text-sm hover:border-[var(--ff-blue)] hover:bg-[rgba(36,55,70,.04)] transition-colors cursor-pointer"
        >
          <AppleIcon className="h-4 w-4" />
          Apple
        </button>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.54-5.17 3.54-8.89z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.93l-3.88-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.12 0-5.77-2.11-6.71-4.95H1.29v3.11A11.99 11.99 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.26A7.21 7.21 0 0 1 4.91 12c0-.78.14-1.54.38-2.26V6.63H1.29A11.99 11.99 0 0 0 0 12c0 1.94.47 3.77 1.29 5.37l4-3.11z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.36.61 4.61 1.81l3.45-3.45C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.63l4 3.11C6.23 6.86 8.88 4.75 12 4.75z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.46 2.23-1.22 3.04-.82.87-2.16 1.54-3.27 1.45-.13-1.1.4-2.25 1.16-3.06.85-.92 2.31-1.6 3.33-1.43zM20.5 17.27c-.55 1.27-.81 1.84-1.52 2.97-.99 1.58-2.38 3.54-4.1 3.56-1.53.01-1.92-.99-4-.98-2.08.01-2.5 1-4.03.98-1.72-.02-3.04-1.79-4.02-3.37C.78 16.34.07 11.07 2.06 7.57c1.42-2.5 3.66-3.96 5.77-3.96 2.14 0 3.49 1.17 5.27 1.17 1.72 0 2.77-1.17 5.25-1.17 1.88 0 3.87.99 5.29 2.7-4.65 2.55-3.89 9.21-3.14 10.96z" />
    </svg>
  );
}
