import type { Metadata } from "next";
import EventForm from "@/components/admin/event-form";

export const metadata: Metadata = { title: "New Event" };

export default function NewEventPage() {
  return <EventForm />;
}
