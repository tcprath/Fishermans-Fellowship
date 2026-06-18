import type { Metadata } from "next";
import DevotionalForm from "@/components/admin/devotional-form";

export const metadata: Metadata = { title: "New Devotional" };

export default function NewDevotionalPage() {
  return <DevotionalForm />;
}
