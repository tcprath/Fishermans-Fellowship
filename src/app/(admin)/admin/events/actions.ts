"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";
import { z } from "zod";

export type EventActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

const SITE_TZ = process.env.NEXT_PUBLIC_SITE_TZ ?? "America/New_York";

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  location: z.string().optional(),
  facebook_event_url: z.string().url().optional().or(z.literal("")),
  image_url: z.string().optional(),
  starts_at: z.string().min(1, "Start date/time required"),
  ends_at: z.string().min(1, "End date/time required"),
  all_day: z.boolean(),
  status: z.enum(["draft", "published"]),
});

async function getAuthClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

function toUTC(localDatetime: string, allDay: boolean): string {
  if (allDay) {
    // For all-day, store at midnight/end-of-day in SITE_TZ
    return fromZonedTime(new Date(`${localDatetime}T00:00:00`), SITE_TZ).toISOString();
  }
  return fromZonedTime(localDatetime, SITE_TZ).toISOString();
}

export async function upsertEvent(
  input: z.infer<typeof schema>
): Promise<EventActionResult> {
  try {
    const supabase = await getAuthClient();
    const data = schema.parse(input);

    const starts_at = toUTC(data.starts_at, data.all_day);
    const ends_at = toUTC(data.ends_at, data.all_day);

    if (new Date(ends_at) < new Date(starts_at)) {
      return { success: false, error: "End must be on or after start" };
    }

    const payload = {
      title: data.title,
      description: data.description ?? null,
      location: data.location ?? null,
      facebook_event_url: data.facebook_event_url || null,
      image_url: data.image_url || null,
      starts_at,
      ends_at,
      all_day: data.all_day,
      status: data.status,
    };

    if (data.id) {
      const { error } = await supabase.from("events").update(payload).eq("id", data.id);
      if (error) return { success: false, error: error.message };
      revalidatePath("/events");
      return { success: true, id: data.id };
    } else {
      const { data: created, error } = await supabase
        .from("events")
        .insert(payload)
        .select("id")
        .single();
      if (error) return { success: false, error: error.message };
      revalidatePath("/events");
      return { success: true, id: created.id };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function deleteEvent(id: string): Promise<EventActionResult> {
  try {
    const supabase = await getAuthClient();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/events");
    return { success: true, id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
