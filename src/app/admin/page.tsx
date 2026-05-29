"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Analytics {
  totalUsers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  activeMembers: number;
  usedInvites: number;
  pendingPayments: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  telegramUsername: string;
  createdAt: string;
  subscriptionStatus: string;
  paymentStatus: string;
  subscriptionExpiry: string | null;
}

type SortOption = "newest" | "oldest" | "active" | "expired";
type FilterOption = "all" | "active" | "expired";

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sort, setSort] = useState<SortOption>("newest");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const [analyticsRes, usersRes] = await Promise.all([
      fetch("/api/admin/analytics"),
      fetch(`/api/admin/users?sort=${sort}&filter=${filter}`),
    ]);

    const analyticsData = await analyticsRes.json();
    const usersData = await usersRes.json();

    setAnalytics(analyticsData);
    setUsers(usersData.users || []);
    setLoading(false);
  }, [sort, filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function removeUser(userId: string) {
    if (!confirm("Remove this member from the mentorship community?")) return;

    const res = await fetch("/api/admin/remove-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reason: "Admin manual removal" }),
    });

    if (res.ok) {
      setActionMsg("User removed successfully");
      loadData();
    } else {
      const data = await res.json();
      setActionMsg(data.error || "Removal failed");
    }
  }

  async function generateInvite(userId: string) {
    const res = await fetch("/api/admin/generate-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (res.ok) {
      setActionMsg(`Invite generated: ${data.inviteLink}`);
      navigator.clipboard.writeText(data.inviteLink);
    } else {
      setActionMsg(data.error || "Failed to generate invite");
    }
  }

  if (loading && !analytics) {
    return <div className="text-gray-400">Loading admin panel...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Feat Trader Admin</h1>
        <p className="text-gray-400">ICT+ mentorship members, contact details and payments</p>
      </div>

      {actionMsg && (
        <div className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm break-all">
          {actionMsg}
        </div>
      )}

      {analytics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Users", value: analytics.totalUsers },
            { label: "Active Subs", value: analytics.activeSubscriptions },
            { label: "Revenue", value: `₹${(analytics.totalRevenue / 100).toLocaleString("en-IN")}` },
            { label: "Active Members", value: analytics.activeMembers },
            { label: "Expired", value: analytics.expiredSubscriptions },
            { label: "Used Invites", value: analytics.usedInvites },
            { label: "Pending Payments", value: analytics.pendingPayments },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs text-gray-500 uppercase tracking-wider">Filter:</span>
        {(["all", "active", "expired"] as FilterOption[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm capitalize ${
              filter === f
                ? "bg-accent/20 text-accent"
                : "bg-surface-elevated text-gray-400"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs text-gray-500 uppercase tracking-wider">Sort:</span>
        {(
          [
            { id: "newest", label: "Newest users" },
            { id: "oldest", label: "Oldest users" },
            { id: "active", label: "Active subscriptions" },
            { id: "expired", label: "Expired subscriptions" },
          ] as { id: SortOption; label: string }[]
        ).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSort(s.id)}
            className={`rounded-lg px-4 py-2 text-sm ${
              sort === s.id
                ? "bg-accent/20 text-accent"
                : "bg-surface-elevated text-gray-400"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-gray-400">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Telegram</th>
              <th className="p-3">Registered</th>
              <th className="p-3">Subscription</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Expiry</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-surface-border/50 hover:bg-surface-elevated/30">
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3 text-gray-400">{user.email}</td>
                <td className="p-3">{user.phoneNumber}</td>
                <td className="p-3">{user.telegramUsername}</td>
                <td className="p-3 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 capitalize">{user.subscriptionStatus}</td>
                <td className="p-3 capitalize">{user.paymentStatus}</td>
                <td className="p-3 whitespace-nowrap">
                  {user.subscriptionExpiry
                    ? new Date(user.subscriptionExpiry).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-xs text-accent hover:underline"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => generateInvite(user.id)}
                      className="text-xs text-accent hover:underline"
                    >
                      Invite
                    </button>
                    <button
                      type="button"
                      onClick={() => removeUser(user.id)}
                      className="text-xs text-loss hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <p className="p-6 text-center text-gray-500">No users match this filter.</p>
        )}
      </div>
    </div>
  );
}
