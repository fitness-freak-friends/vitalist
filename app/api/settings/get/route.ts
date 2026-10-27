import { getSession } from "@/lib/session";
import { json, rateLimit } from "@/lib/security";
import { getSettings } from "@/lib/setting-service";

export async function GET() {
  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;

  const rl = rateLimit(`settings:read:${userId}`, 120, 60_000);
  if (!rl.ok) return json({ error: "Too many requests." }, 429, { "Retry-After": String(rl.retryAfter) });

  try {
    const data = await getSettings(userId);
    if (!data) return json({ error: "Not found" }, 404);
    return json(data);
  } catch (err) {
    console.error("[settings/get] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}