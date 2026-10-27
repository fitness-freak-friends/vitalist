import { z } from "zod";
import { getSession } from "@/lib/session";
import { json, rateLimit } from "@/lib/security";
import { METRICS } from "@/lib/progress";
import { getSeries } from "@/lib/progress-service";

const query = z.object({ metric: z.enum(METRICS) });

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;

  const rl = rateLimit(`progress:read:${userId}`, 120, 60_000);
  if (!rl.ok) return json({ error: "Too many requests." }, 429, { "Retry-After": String(rl.retryAfter) });

  const parsed = query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return json({ error: "Invalid metric." }, 400);

  try {
    return json({ points: await getSeries(userId, parsed.data.metric) });
  } catch (err) {
    console.error("[progress/series] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}