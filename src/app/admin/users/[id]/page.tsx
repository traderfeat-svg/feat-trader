"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  telegramUsername: string;
  telegramUserId?: number;
  subscriptionStatus: string;
  subscriptionStart?: string;
  subscriptionExpiry?: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentRow {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  createdAt: string;
  processedAt?: string;
}

interface HistoryRow {
  id: string;
  action: string;
  startDate: string;
  endDate: string;
  notes?: string;
  createdAt: string;
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUser(data.user);
          setPayments(data.payments || []);
          setHistory(data.subscriptionHistory || []);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-gray-400">Loading member details...</p>;
  }

  if (error || !user) {
    return (
      <div>
        <p className="text-loss">{error || "User not found"}</p>
        <Link href="/admin" className="mt-4 inline-block text-accent hover:underline">
          ← Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-400">Member details — no password data is stored or shown</p>
        </div>
        <Link href="/admin" className="btn-secondary text-sm">
          ← Back to list
        </Link>
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Contact & Account</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-400">Name</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Phone Number</dt>
            <dd className="font-medium">{user.phoneNumber || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Telegram Username</dt>
            <dd className="font-medium">
              {user.telegramUsername ? `@${user.telegramUsername}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Registration Date</dt>
            <dd className="font-medium">
              {new Date(user.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Last Updated</dt>
            <dd className="font-medium">
              {new Date(user.updatedAt).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Subscription</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-400">Status</dt>
            <dd className="font-medium capitalize">{user.subscriptionStatus}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Payment Status</dt>
            <dd className="font-medium capitalize">{user.paymentStatus}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Start</dt>
            <dd className="font-medium">
              {user.subscriptionStart
                ? new Date(user.subscriptionStart).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Expiry</dt>
            <dd className="font-medium">
              {user.subscriptionExpiry
                ? new Date(user.subscriptionExpiry).toLocaleDateString()
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="glass-card overflow-x-auto p-6">
        <h2 className="mb-4 text-lg font-semibold">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-500">No payments recorded.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-gray-400">
                <th className="p-2">Date</th>
                <th className="p-2">Order ID</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Method</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-surface-border/40">
                  <td className="p-2">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2 font-mono text-xs">{p.razorpayOrderId}</td>
                  <td className="p-2">
                    ₹{(p.amount / 100).toLocaleString("en-IN")} {p.currency}
                  </td>
                  <td className="p-2 capitalize">{p.status}</td>
                  <td className="p-2">{p.method || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {history.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Subscription History</h2>
          <ul className="space-y-3 text-sm">
            {history.map((h) => (
              <li key={h.id} className="border-b border-surface-border/40 pb-3">
                <span className="capitalize font-medium text-emerald-300">{h.action}</span>
                <span className="text-gray-500">
                  {" "}
                  · {new Date(h.startDate).toLocaleDateString()} →{" "}
                  {new Date(h.endDate).toLocaleDateString()}
                </span>
                {h.notes && <p className="mt-1 text-gray-500">{h.notes}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
