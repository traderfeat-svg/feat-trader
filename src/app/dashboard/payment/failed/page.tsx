import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <div className="flex justify-center">
      <div className="glass-card max-w-lg p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-loss/20 text-3xl text-loss">
          ✕
        </div>
        <h1 className="mb-2 text-2xl font-bold text-loss">Payment Failed</h1>
        <p className="mb-6 text-gray-400">
          Your payment could not be processed. No charges were made to your
          account. Please try again.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard/payment" className="btn-primary">
            Try Again
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
