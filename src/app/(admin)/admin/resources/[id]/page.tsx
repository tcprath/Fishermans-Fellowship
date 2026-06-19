import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResourceForm from "@/components/admin/resource-form";
import { listTags } from "@/app/(admin)/admin/tags/actions";
import type { ResourceRow } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Edit Resource" };

export const revalidate = 0;

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: resource }, { data: resourceTags }, allTags] = await Promise.all([
    supabase.from("resources").select("*").eq("id", id).single(),
    supabase.from("resource_tags").select("tag_id").eq("resource_id", id),
    listTags(),
  ]);

  if (!resource) notFound();

  const initialTagIds = (resourceTags ?? []).map((r) => r.tag_id as string);

  return (
    <ResourceForm
      resource={resource as ResourceRow}
      allTags={allTags}
      initialTagIds={initialTagIds}
    />
  );
}
