import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard-nav";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <DashboardNav />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50/80">
        <header className="relative z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
          <p className="truncate text-sm text-slate-600">
            {user.email ?? "Administrador"}
          </p>
          <SignOutButton />
        </header>
        <main className="relative z-10 flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
