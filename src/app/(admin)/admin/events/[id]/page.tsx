import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EventForm from "@/components/admin/event-form";
import type { EventRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Edit Event" };

export const revalidate = 0;

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  return <EventForm event={event as EventRow} />;
}
