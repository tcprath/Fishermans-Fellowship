import type { Metadata } from "next";
import DevotionalForm from "@/components/admin/devotional-form";

export const metadata: Metadata = { title: "New Devotional" };

export default async function NewDevotionalPage({
  searchParams,
}: {
  searchParams: Promise<{ cal_month?: string; cal_day?: string }>;
}) {
  const sp = await searchParams;
  const calMonth = sp.cal_month ? parseInt(sp.cal_month, 10) : undefined;
  const calDay = sp.cal_day ? parseInt(sp.cal_day, 10) : undefined;
  return <DevotionalForm initialCalMonth={calMonth} initialCalDay={calDay} />;
}
