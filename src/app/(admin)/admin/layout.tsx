import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar email={user.email ?? ""} />
      <div className="flex-1 min-w-0 overflow-auto">
        <main className="p-6 lg:p-8 max-w-5xl">{children}</main>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
