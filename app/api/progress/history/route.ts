import { z } from "zod";
import { getSession } from "@/lib/session";
import { json, rateLimit } from "@/lib/security";
import { getMeasurementHistory } from "@/lib/progress-service";

const query = z.object({
  take: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().min(1).max(64).optional(),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;

  const rl = rateLimit(`progress:read:${userId}`, 120, 60_000);
  if (!rl.ok) return json({ error: "Too many requests." }, 429, { "Retry-After": String(rl.retryAfter) });

  const parsed = query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return json({ error: "Invalid query." }, 400);

  try {
    return json(await getMeasurementHistory(userId, parsed.data.take, parsed.data.cursor));
  } catch (err) {
    console.error("[progress/history] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}