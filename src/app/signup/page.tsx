"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { BRAND } from "@/content/brand";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    telegramUsername: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 pt-24 pb-12">
        <form onSubmit={handleSubmit} className="glass-card w-full max-w-md p-8">
          <h1 className="mb-2 text-2xl font-bold text-white">Create Account</h1>
          <p className="mb-6 text-sm text-gray-400">
            Register for the {BRAND.program}. All fields are required for membership and
            mentorship access.
          </p>
          {error && (
            <div className="mb-4 rounded-lg border border-loss/30 bg-loss/10 px-4 py-3 text-sm text-loss">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Full Name *</label>
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Phone Number *</label>
              <input
                type="tel"
                required
                inputMode="numeric"
                minLength={10}
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="input-field"
                placeholder="10-digit mobile number"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Telegram Username *</label>
              <input
                required
                value={form.telegramUsername}
                onChange={(e) =>
                  setForm({ ...form, telegramUsername: e.target.value })
                }
                className="input-field"
                placeholder="username (without @)"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Password *</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
            {loading ? "Creating account..." : "Join ICT+ Mentorship"}
          </button>
          <p className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
