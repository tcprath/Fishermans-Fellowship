import { formatInTimeZone } from "date-fns-tz";

const TZ = process.env.NEXT_PUBLIC_SITE_TZ ?? "America/New_York";

function icsEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  const MAX = 75;
  if (line.length <= MAX) return line;
  let out = "";
  let i = 0;
  while (i < line.length) {
    const chunk = i === 0 ? MAX : MAX - 1;
    if (i > 0) out += "\r\n ";
    out += line.slice(i, i + chunk);
    i += chunk;
  }
  return out;
}

export type ICSEvent = {
  uid: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
};

export function generateICS(event: ICSEvent): string {
  const stamp = formatInTimeZone(new Date(), "UTC", "yyyyMMdd'T'HHmmss'Z'");

  let dtstart: string;
  let dtend: string;

  if (event.allDay) {
    dtstart = `DTSTART;VALUE=DATE:${formatInTimeZone(new Date(event.startsAt), TZ, "yyyyMMdd")}`;
    dtend   = `DTEND;VALUE=DATE:${formatInTimeZone(new Date(event.endsAt), TZ, "yyyyMMdd")}`;
  } else {
    dtstart = `DTSTART:${formatInTimeZone(new Date(event.startsAt), "UTC", "yyyyMMdd'T'HHmmss'Z'")}`;
    dtend   = `DTEND:${formatInTimeZone(new Date(event.endsAt),   "UTC", "yyyyMMdd'T'HHmmss'Z'")}`;
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fisherman's Fellowship//Ministry Site//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    foldLine(`UID:${icsEscape(event.uid)}`),
    `DTSTAMP:${stamp}`,
    dtstart,
    dtend,
    foldLine(`SUMMARY:${icsEscape(event.title)}`),
    event.description ? foldLine(`DESCRIPTION:${icsEscape(event.description)}`) : null,
    event.location    ? foldLine(`LOCATION:${icsEscape(event.location)}`)       : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];

  return lines.join("\r\n") + "\r\n";
}
