"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RazorpayCheckout } from "@/components/RazorpayCheckout";
import { BRAND } from "@/content/brand";

interface MeUser {
  profileComplete?: boolean;
  name?: string;
  email?: string;
  phoneNumber?: string;
  telegramUsername?: string;
}

interface PaymentGateProps {
  amountLabel: string;
}

export function PaymentGate({ amountLabel }: PaymentGateProps) {
  const [user, setUser] = useState<MeUser | null>(null);
  const [missingLabels, setMissingLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          if (!data.user.profileComplete) {
            const missing: string[] = [];
            if (!data.user.name || data.user.name.length < 2) missing.push("Full Name");
            if (!data.user.email) missing.push("Email");
            if (!data.user.phoneNumber || data.user.phoneNumber.length < 10) {
              missing.push("Phone Number");
            }
            if (!data.user.telegramUsername) missing.push("Telegram Username");
            setMissingLabels(missing);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-400">Checking profile...</p>;
  }

  if (user && !user.profileComplete) {
    return (
      <div className="rounded-lg border border-loss/30 bg-loss/10 p-4">
        <h3 className="mb-2 font-semibold text-loss">Profile incomplete</h3>
        <p className="mb-3 text-sm text-gray-400">
          Complete the following before purchasing {BRAND.program} access:
        </p>
        <ul className="mb-4 list-inside list-disc text-sm text-gray-300">
          {missingLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        <Link href="/dashboard/subscription" className="btn-primary inline-block text-sm">
          Complete Profile
        </Link>
      </div>
    );
  }

  return <RazorpayCheckout amountLabel={amountLabel} />;
}
