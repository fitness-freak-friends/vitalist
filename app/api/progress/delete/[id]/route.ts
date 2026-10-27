import { z } from "zod";
import { getSession } from "@/lib/session";
import { json, isSameOrigin, rateLimit } from "@/lib/security";
import { deleteMeasurement } from "@/lib/progress-service";

const idSchema = z.string().min(1).max(64);

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);

  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;

  const rl = rateLimit(`progress:write:${userId}`, 30, 60_000);
  if (!rl.ok) return json({ error: "Too many requests." }, 429, { "Retry-After": String(rl.retryAfter) });

  const id = idSchema.safeParse((await params).id);
  if (!id.success) return json({ error: "Not found" }, 404);

  try {
    if (!(await deleteMeasurement(userId, id.data))) return json({ error: "Not found" }, 404);
    return json({ ok: true });
  } catch (err) {
    console.error("[progress/delete] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}