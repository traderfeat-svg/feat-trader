"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { BRAND } from "@/content/brand";

function SuccessContent() {
  const searchParams = useSearchParams();
  const link = searchParams.get("link");

  return (
    <div className="glass-card max-w-lg p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-profit/20 text-3xl text-profit">
        ✓
      </div>
      <h1 className="mb-2 text-2xl font-bold text-profit">Payment Successful</h1>
      <p className="mb-6 text-gray-400">
        Your {BRAND.program} access is active. Use your community invite to join the mentorship
        channel.
      </p>

      {link && (
        <div className="mb-6 rounded-lg bg-surface-elevated p-4">
          <p className="mb-2 text-sm text-gray-400">Private community invite:</p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-accent hover:underline"
          >
            {link}
          </a>
          <p className="mt-2 text-xs text-gray-500">
            Use this link promptly to join the {BRAND.community}.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Join Community
          </a>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="flex justify-center">
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
