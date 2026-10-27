import { getSession } from "@/lib/session";
import { json, rateLimit } from "@/lib/security";
import { getGoalProgress } from "@/lib/progress-service";

export async function GET() {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;

  const rl = rateLimit(`progress:read:${userId}`, 120, 60_000);
  if (!rl.ok) return json({ error: "Too many requests." }, 429, { "Retry-After": String(rl.retryAfter) });

  try {
    return json({ goal: await getGoalProgress(userId) });
  } catch (err) {
    console.error("[progress/goal/get] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}