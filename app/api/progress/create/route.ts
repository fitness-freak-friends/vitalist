import { z } from "zod";
import { getSession } from "@/lib/session";
import { json, isSameOrigin, rateLimit } from "@/lib/security";
import { METRICS, METRIC_INFO, type MetricInfo } from "@/lib/progress";
import { createMeasurement } from "@/lib/progress-service";

const num = (i: MetricInfo) => {
  const msg = `${i.label} must be between ${i.min} and ${i.max} ${i.unit}.`;
  return z.number().min(i.min, msg).max(i.max, msg);
};

function dateOk(s: string) {
  const t = new Date(`${s}T12:00:00.000Z`).getTime();
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  return t <= now + 36 * 3600_000 && t >= now - 10 * 365 * 24 * 3600_000;
}

const schema = z
  .object({
    weightKg: num(METRIC_INFO.weightKg).optional(),
    bodyFatPct: num(METRIC_INFO.bodyFatPct).optional(),
    waistCm: num(METRIC_INFO.waistCm).optional(),
    chestCm: num(METRIC_INFO.chestCm).optional(),
    hipsCm: num(METRIC_INFO.hipsCm).optional(),
    armCm: num(METRIC_INFO.armCm).optional(),
    thighCm: num(METRIC_INFO.thighCm).optional(),
    measuredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.").optional(),
    notes: z.string().trim().max(200, "Notes can be 200 characters at most.").optional(),
  })
  .strict() 
  .refine((v) => METRICS.some((m) => v[m] !== undefined), { message: "Enter at least one measurement." })
  .refine((v) => !v.measuredAt || dateOk(v.measuredAt), {
    message: "Date must be within the last 10 years and not in the future.",
    path: ["measuredAt"],
  });

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);

  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;

  const rl = rateLimit(`progress:write:${userId}`, 30, 60_000);
  if (!rl.ok) return json({ error: "Too many requests." }, 429, { "Retry-After": String(rl.retryAfter) });

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Unsupported content type." }, 415);
  }

  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON." }, 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, 400);

  try {
    return json(await createMeasurement(userId, parsed.data), 201);
  } catch (err) {
    console.error("[progress/create] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}