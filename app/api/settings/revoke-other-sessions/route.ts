import { getSession } from "@/lib/session";
import { json, isSameOrigin, rateLimit } from "@/lib/security";
import { revokeOtherUserSessions } from "@/lib/setting-service";

export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);

  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;

  const rl = rateLimit(`settings:write:${userId}`, 20, 60_000);
  if (!rl.ok) return json({ error: "Too many requests." }, 429, { "Retry-After": String(rl.retryAfter) });

  try {
    const count = await revokeOtherUserSessions(userId, session.session.id);
    return json({ ok: true, revoked: count });
  } catch (err) {
    console.error("[settings/revoke-other-sessions] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}