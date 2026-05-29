function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCatalogChangesError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return msg.toLowerCase().includes("catalog changes");
}

function isRetryableMongoError(err: unknown): boolean {
  if (isCatalogChangesError(err)) return true;
  const e = err as any;

  // MongoDB retry labels can exist on native driver errors.
  if (typeof e?.hasErrorLabel === "function") {
    if (e.hasErrorLabel("TransientTransactionError")) return true;
    if (e.hasErrorLabel("RetryableWriteError")) return true;
  }

  const code = e?.code;
  // Common retryable-ish codes (kept intentionally broad; we still cap retries).
  return code === 112 || code === 136 || code === 91 || code === 16500;
}

export async function withMongoWriteRetries<T>(
  fn: () => Promise<T>,
  opts?: { retries?: number; baseDelayMs?: number; label?: string }
): Promise<T> {
  const retries = opts?.retries ?? 5;
  const baseDelayMs = opts?.baseDelayMs ?? 200;
  const label = opts?.label ?? "mongo_write";

  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const retryable = isRetryableMongoError(err);
      console.error(
        `[withMongoWriteRetries] ${label} failed (attempt ${attempt}/${retries}) retryable=${retryable}`,
        err instanceof Error ? err.message : err
      );

      if (!retryable || attempt === retries) break;
      const delay = baseDelayMs * attempt * attempt; // quadratic backoff
      await sleep(delay);
    }
  }

  throw lastErr;
}

