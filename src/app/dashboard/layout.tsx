import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { BRAND } from "@/content/brand";

export const metadata: Metadata = {
  title: BRAND.meta.dashboard,
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-surface-border bg-surface-elevated/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <span className="font-bold text-white">
            {BRAND.meta.dashboard}
          </span>
          <span className="text-sm text-gray-400">{session.email}</span>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:p-8">
        <DashboardNav isAdmin={session.role === "admin"} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
