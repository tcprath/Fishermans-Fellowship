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

  // Login page lives in (admin-login) route group — NOT wrapped by this layout.
  // So this redirect is safe: it only fires for /admin/* pages (dashboard, posts, etc.).
  if (!user) redirect("/admin/login");

  const email = user.email ?? "";

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar email={email} />
      <div className="flex-1 min-w-0 overflow-auto">
        <main className="p-6 lg:p-8 max-w-5xl">{children}</main>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
