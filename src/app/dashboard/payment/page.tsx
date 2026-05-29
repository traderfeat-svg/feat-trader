import type { Metadata } from "next";
import { PaymentGate } from "@/components/PaymentGate";
import { BRAND } from "@/content/brand";

export const metadata: Metadata = {
  title: BRAND.meta.payment,
};

const amount = parseInt(process.env.SUBSCRIPTION_AMOUNT_PAISE || "99900", 10);
const price = `₹${(amount / 100).toLocaleString("en-IN")}`;

export default function PaymentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{BRAND.meta.payment}</h1>
        <p className="text-gray-400">
          Purchase 6-month access to the {BRAND.program}
        </p>
      </div>

      <div className="glass-card max-w-lg p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            {BRAND.program}
          </p>
          <p className="mt-2 text-sm text-gray-400">6-month mentorship access</p>
          <p className="mt-2 text-4xl font-bold text-accent">{price}</p>
        </div>

        <ul className="mb-8 space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="text-profit">✓</span> Full ICT+ curriculum & community access
          </li>
          <li className="flex gap-2">
            <span className="text-profit">✓</span> Private community invite after payment
          </li>
          <li className="flex gap-2">
            <span className="text-profit">✓</span> UPI, Cards, Net Banking, Wallets
          </li>
          <li className="flex gap-2">
            <span className="text-profit">✓</span> Secure Razorpay checkout
          </li>
        </ul>

        <PaymentGate amountLabel={price} />

        <p className="mt-4 text-center text-xs text-gray-500">
          Secured by Razorpay. Educational mentorship — no profit guarantees.
        </p>
      </div>
    </div>
  );
}
