import { z } from "zod";
import { getSession } from "@/lib/session";
import { json, isSameOrigin, rateLimit } from "@/lib/security";
import { revokeUserSession } from "@/lib/setting-service";

const idSchema = z.string().min(1).max(64);

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);

  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;

  const rl = rateLimit(`settings:write:${userId}`, 20, 60_000);
  if (!rl.ok) return json({ error: "Too many requests." }, 429, { "Retry-After": String(rl.retryAfter) });

  const id = idSchema.safeParse((await params).id);
  if (!id.success) return json({ error: "Not found" }, 404);

  try {
    const done = await revokeUserSession(userId, id.data, session.session.id);
    if (!done) return json({ error: "Not found" }, 404);
    return json({ ok: true });
  } catch (err) {
    console.error("[settings/revoke-session] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}