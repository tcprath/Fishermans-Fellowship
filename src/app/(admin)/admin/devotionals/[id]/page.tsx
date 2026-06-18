import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DevotionalForm from "@/components/admin/devotional-form";
import type { DevotionalRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Edit Devotional" };

export const revalidate = 0;

export default async function EditDevotionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: devotional } = await supabase
    .from("devotionals")
    .select("*")
    .eq("id", id)
    .single();

  if (!devotional) notFound();

  return <DevotionalForm devotional={devotional as DevotionalRow} />;
}
