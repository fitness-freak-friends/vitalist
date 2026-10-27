import { z } from "zod";
import { getSession } from "@/lib/session";
import { json, rateLimit } from "@/lib/security";
import { getBmiHistory } from "@/lib/bmi-service";

const querySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().min(1).max(64).optional(),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;

  const rl = rateLimit(`bmi:read:${userId}`, 120, 60_000);
  if (!rl.ok) return json({ error: "Too many requests." }, 429, { "Retry-After": String(rl.retryAfter) });

  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) return json({ error: "Invalid query." }, 400);

  try {
    return json(await getBmiHistory(userId, parsed.data.take, parsed.data.cursor));
  } catch (err) {
    console.error("[bmi/history] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}