import { notFound } from "next/navigation";
import { getEventById } from "@/lib/content";
import { generateICS } from "@/lib/ics";

type Params = { id: string };

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const ics = generateICS({
    uid: `${event.id}@fishermansfellowship.com`,
    title: event.title,
    description: event.description,
    location: event.location,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    allDay: event.all_day,
  });

  const filename = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
