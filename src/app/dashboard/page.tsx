"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BRAND } from "@/content/brand";

interface UserData {
  user: {
    name: string;
    subscriptionStatus: string;
    subscriptionExpiry?: string;
    telegramUsername?: string;
  };
  activeInvite: {
    link: string;
    expiresAt: string;
    status: string;
  } | null;
  latestInvite: {
    link: string;
    expiresAt: string;
    status: string;
    usedAt?: string;
  } | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  function copyLink(link: string) {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <div className="text-gray-400">Loading dashboard...</div>;
  }

  if (!data?.user) {
    return <div className="text-loss">Failed to load dashboard</div>;
  }

  const { user, activeInvite, latestInvite } = data;
  const isActive = user.subscriptionStatus === "active";
  const invite = activeInvite || latestInvite;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {user.name}</h1>
        <p className="text-gray-400">
          Manage your {BRAND.program} subscription and {BRAND.community} access
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="stat-card">
          <p className="text-sm text-gray-400">Mentorship Status</p>
          <p
            className={`mt-1 text-xl font-bold capitalize ${
              isActive ? "text-profit" : "text-gray-300"
            }`}
          >
            {user.subscriptionStatus}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-400">Access Until</p>
          <p className="mt-1 text-xl font-bold">
            {user.subscriptionExpiry
              ? new Date(user.subscriptionExpiry).toLocaleDateString()
              : "—"}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-400">Community Username</p>
          <p className="mt-1 text-xl font-bold">
            {user.telegramUsername ? `@${user.telegramUsername}` : "Not set"}
          </p>
        </div>
      </div>

      {invite && invite.status === "active" && new Date(invite.expiresAt) > new Date() ? (
        <div className="glass-card border-accent/30 p-6">
          <h2 className="mb-2 text-lg font-semibold text-accent">
            Private Community Invite
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            Use this link to join the {BRAND.community}. Valid for a limited time after purchase.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              readOnly
              value={invite.link}
              className="input-field flex-1 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => copyLink(invite.link)}
              className="btn-secondary whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <a
              href={invite.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-center whitespace-nowrap"
            >
              Join Community
            </a>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Expires: {new Date(invite.expiresAt).toLocaleString()}
          </p>
        </div>
      ) : !isActive ? (
        <div className="glass-card p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold">No Active Mentorship</h2>
          <p className="mb-4 text-gray-400">
            Purchase access to join the {BRAND.program} and {BRAND.community}.
          </p>
          <Link href="/dashboard/payment" className="btn-primary">
            Get ICT+ Access
          </Link>
        </div>
      ) : invite?.status === "used" ? (
        <div className="glass-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-profit">Community Access Active</h2>
          <p className="text-gray-400">
            Your invite has been used. You should have access to the mentorship channel.
          </p>
        </div>
      ) : (
        <div className="glass-card p-6">
          <p className="text-gray-400">
            Invite link expired. Contact support if you need a new link.
          </p>
        </div>
      )}
    </div>
  );
}
