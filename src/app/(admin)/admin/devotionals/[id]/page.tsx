import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DevotionalForm from "@/components/admin/devotional-form";
import { listTags } from "@/app/(admin)/admin/tags/actions";
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

  const [{ data: devotional }, { data: devTags }, allTags] = await Promise.all([
    supabase.from("devotionals").select("*").eq("id", id).single(),
    supabase.from("devotional_tags").select("tag_id").eq("devotional_id", id),
    listTags(),
  ]);

  if (!devotional) notFound();

  const initialTagIds = (devTags ?? []).map((r) => r.tag_id as string);

  return (
    <DevotionalForm
      devotional={devotional as DevotionalRow}
      allTags={allTags}
      initialTagIds={initialTagIds}
    />
  );
}
