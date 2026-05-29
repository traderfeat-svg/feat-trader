const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

export function getSubscriptionExpiryDate(fromDate: Date = new Date()): Date {
  return new Date(fromDate.getTime() + SIX_MONTHS_MS);
}

export function isSubscriptionActive(expiryDate: Date | null | undefined): boolean {
  if (!expiryDate) return false;
  return new Date() < new Date(expiryDate);
}

export function getSubscriptionAmountPaise(): number {
  return parseInt(process.env.SUBSCRIPTION_AMOUNT_PAISE || "99900", 10);
}

export function formatAmount(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}
