"use client";

import { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutProps {
  amountLabel: string;
  disabled?: boolean;
}

export function RazorpayCheckout({
  amountLabel,
  disabled,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    setLoading(true);
    setError("");

    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        if (orderData.code === "PROFILE_INCOMPLETE" && orderData.missingLabels?.length) {
          throw new Error(
            `Complete your profile first: ${orderData.missingLabels.join(", ")}`
          );
        }
        throw new Error(orderData.error || "Failed to create order");
      }

      if (!window.Razorpay) {
        throw new Error("Payment gateway not loaded");
      }

      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Feat Trader",
        description: "ICT+ Mentorship Program — 6 Months",
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user.name,
          email: orderData.user.email,
        },
        theme: { color: "#10b981" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Verification failed");
            }

            window.location.href = `/dashboard/success?link=${encodeURIComponent(verifyData.inviteLink || "")}`;
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Payment verification failed"
            );
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <button
        type="button"
        onClick={handlePayment}
        disabled={disabled || loading}
        className="btn-primary w-full"
      >
        {loading ? "Processing..." : `Pay ${amountLabel}`}
      </button>
      {error && (
        <p className="mt-3 text-center text-sm text-loss">{error}</p>
      )}
    </>
  );
}
