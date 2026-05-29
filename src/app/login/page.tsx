"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { BRAND } from "@/content/brand";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card w-full max-w-md p-8">
      <h1 className="mb-2 text-2xl font-bold text-white">Welcome Back</h1>
      <p className="mb-6 text-sm text-gray-400">Sign in to your {BRAND.name} account</p>
      {error && (
        <div className="mb-4 rounded-lg border border-loss/30 bg-loss/10 px-4 py-3 text-sm text-loss">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-400">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
          />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <p className="mt-4 text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Join ICT+ Mentorship
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 pt-24">
        <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
