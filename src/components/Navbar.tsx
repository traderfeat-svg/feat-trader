"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BRAND } from "@/content/brand";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/mentorship", label: "ICT+ Curriculum" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-surface-border/50 bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-900/40">
            <span className="text-lg font-bold tracking-tight">F</span>
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-base font-semibold tracking-wide text-white">
              {BRAND.name}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500">
              {BRAND.program}
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                pathname === link.href ? "text-accent" : "text-gray-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="btn-secondary py-2 text-sm">
            Login
          </Link>
          <Link href="/signup" className="btn-primary py-2 text-sm">
            Join ICT+ Mentorship
          </Link>
        </div>

        <button
          type="button"
          className="text-gray-300 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-surface-border bg-surface-elevated px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-gray-300 hover:text-accent"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" className="btn-secondary text-center text-sm">
              Login
            </Link>
            <Link href="/signup" className="btn-primary text-center text-sm">
              Join ICT+ Mentorship
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
