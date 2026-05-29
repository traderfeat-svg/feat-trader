"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BRAND } from "@/content/brand";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/payment", label: "Mentorship Access" },
  { href: "/dashboard/subscription", label: "Subscription" },
];

export function DashboardNav({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="glass-card flex w-full flex-col p-4 lg:w-64 lg:min-h-[calc(100vh-8rem)]">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white text-sm">
          F
        </div>
        <div>
          <span className="block text-sm font-bold text-white">{BRAND.name}</span>
          <span className="text-xs text-gray-500">Dashboard</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-accent/10 text-accent"
                : "text-gray-400 hover:bg-surface-elevated hover:text-gray-200"
            }`}
          >
            {link.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              pathname.startsWith("/admin")
                ? "bg-accent/10 text-accent"
                : "text-gray-400 hover:bg-surface-elevated hover:text-gray-200"
            }`}
          >
            {BRAND.meta.admin}
          </Link>
        )}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 rounded-lg px-4 py-2.5 text-left text-sm text-loss hover:bg-loss/10"
      >
        Logout
      </button>
    </aside>
  );
}
