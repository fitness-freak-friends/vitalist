
const HEADERS = { "Cache-Control": "private, no-store" };

export function json(data: unknown, status = 200, extra: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { ...HEADERS, ...extra } });
}


export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const allowed = process.env.BETTER_AUTH_URL;
  if (!origin || !allowed) return false;
  try {
    return new URL(origin).origin === new URL(allowed).origin;
  } catch {
    return false;
  }
}

type Bucket = { count: number; resetAt: number };
const g = globalThis as unknown as { __buckets?: Map<string, Bucket> };
const buckets = (g.__buckets ??= new Map<string, Bucket>());

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit) return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  b.count++;
  return { ok: true, retryAfter: 0 };
}