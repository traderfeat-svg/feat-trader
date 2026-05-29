import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/content/brand";

export const metadata: Metadata = {
  title: BRAND.meta.pricing,
};

const amount = parseInt(process.env.SUBSCRIPTION_AMOUNT_PAISE || "99900", 10);

export default function PricingPage() {
  const price = `₹${(amount / 100).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold">
            ICT+ Mentorship <span className="gradient-text">Pricing</span>
          </h1>
          <p className="mb-12 text-gray-400">
            One program. Six months of structured ICT+ education and {BRAND.community} access.
          </p>

          <div className="glass-card mx-auto max-w-md border-emerald-500/20 p-8">
            <div className="mb-2 text-sm font-medium uppercase tracking-wider text-accent">
              {BRAND.program}
            </div>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">{price}</span>
              <span className="text-gray-400"> / 6 months</span>
            </div>
            <ul className="mb-8 space-y-3 text-left text-gray-300">
              {[
                "Full ICT+ curriculum — structure, bias, POIs, blocks & gaps",
                "Private mentorship community access",
                "Market reviews and trade breakdowns",
                "UPI, Cards, Net Banking, Wallets",
                "Secure Razorpay payments",
                "6 months structured learning access",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-profit">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-primary w-full block text-center">
              Join ICT+ Mentorship
            </Link>
            <p className="mt-4 text-xs text-gray-500">
              Educational mentorship only. No profit or win-rate guarantees.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
