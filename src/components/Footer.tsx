import Link from "next/link";
import { BRAND } from "@/content/brand";

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-elevated">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white text-sm">
                F
              </div>
              <div>
                <span className="font-semibold text-white">{BRAND.name}</span>
                <p className="text-xs text-gray-500">{BRAND.program}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/mentorship" className="hover:text-accent">
              Curriculum
            </Link>
            <Link href="/pricing" className="hover:text-accent">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-accent">
              Login
            </Link>
            <Link href="/signup" className="hover:text-accent">
              Join
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {BRAND.name}. Educational mentorship only.
          </p>
        </div>
      </div>
    </footer>
  );
}
