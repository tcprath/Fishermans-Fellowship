import type { Metadata } from "next";
import ResourceForm from "@/components/admin/resource-form";
import { listTags } from "@/app/(admin)/admin/tags/actions";

export const metadata: Metadata = { title: "New Resource" };

export default async function NewResourcePage() {
  const allTags = await listTags();
  return <ResourceForm allTags={allTags} />;
}
