"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/content/brand";

export default function SubscriptionPage() {
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    phoneNumber?: string;
    subscriptionStatus: string;
    subscriptionStart?: string;
    subscriptionExpiry?: string;
    telegramUsername?: string;
    telegramUserId?: number;
    profileComplete?: boolean;
  } | null>(null);
  const [profile, setProfile] = useState({
    name: "",
    phoneNumber: "",
    telegramUsername: "",
    telegramUserId: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setProfile({
            name: data.user.name || "",
            phoneNumber: data.user.phoneNumber || "",
            telegramUsername: data.user.telegramUsername || "",
            telegramUserId: data.user.telegramUserId?.toString() || "",
          });
        }
      });
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        telegramUsername: profile.telegramUsername,
        telegramUserId: profile.telegramUserId
          ? parseInt(profile.telegramUserId, 10)
          : undefined,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Profile updated successfully");
      setUser(data.user);
    } else {
      setMessage(data.error || "Update failed");
    }
    setSaving(false);
  }

  const daysLeft = user?.subscriptionExpiry
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.subscriptionExpiry).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        <p className="text-gray-400">Your {BRAND.program} membership details</p>
      </div>

      {user && !user.profileComplete && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Complete your profile (name, phone, Telegram username) before purchasing mentorship
          access.
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Mentorship Details</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-400">Status</dt>
            <dd className="font-medium capitalize">{user?.subscriptionStatus || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Days Remaining</dt>
            <dd className="font-medium">{daysLeft} days</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Start Date</dt>
            <dd className="font-medium">
              {user?.subscriptionStart
                ? new Date(user.subscriptionStart).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Expiry Date</dt>
            <dd className="font-medium">
              {user?.subscriptionExpiry
                ? new Date(user.subscriptionExpiry).toLocaleDateString()
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <form onSubmit={saveProfile} className="glass-card p-6">
        <h2 className="mb-2 text-lg font-semibold">Your Profile</h2>
        <p className="mb-4 text-sm text-gray-400">
          Required for mentorship access and community verification. Passwords are never shown
          here.
        </p>
        {message && (
          <p
            className={`mb-4 text-sm ${
              message.includes("success") ? "text-profit" : "text-loss"
            }`}
          >
            {message}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-gray-400">Email</label>
            <input
              readOnly
              value={user?.email || ""}
              className="input-field cursor-not-allowed opacity-60"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Full Name *</label>
            <input
              required
              minLength={2}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Phone Number *</label>
            <input
              required
              type="tel"
              minLength={10}
              value={profile.phoneNumber}
              onChange={(e) =>
                setProfile({ ...profile, phoneNumber: e.target.value })
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Telegram Username *</label>
            <input
              required
              value={profile.telegramUsername}
              onChange={(e) =>
                setProfile({ ...profile, telegramUsername: e.target.value })
              }
              className="input-field"
              placeholder="username"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Telegram User ID (optional)
            </label>
            <input
              type="number"
              value={profile.telegramUserId}
              onChange={(e) =>
                setProfile({ ...profile, telegramUserId: e.target.value })
              }
              className="input-field"
            />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary mt-4">
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
