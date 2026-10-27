import { z } from "zod";
import { getSession } from "@/lib/session";
import { json, isSameOrigin, rateLimit } from "@/lib/security";
import { setWeightGoal } from "@/lib/progress-service";

function deadlineOk(s: string) {
  const end = new Date(`${s}T23:59:59.000Z`).getTime();
  if (Number.isNaN(end)) return false;
  const now = Date.now();
  return end > now && end < now + 5 * 365 * 24 * 3600_000;
}

const schema = z
  .object({
    targetKg: z.number()
      .min(25, "Target must be between 25 and 400 kg.")
      .max(400, "Target must be between 25 and 400 kg."),
    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.").optional(),
  })
  .strict()
  .refine((v) => !v.deadline || deadlineOk(v.deadline), {
    message: "Deadline must be in the future, within 5 years.",
    path: ["deadline"],
  });

export async function PUT(req: Request) {
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
    const result = await setWeightGoal(userId, parsed.data.targetKg, parsed.data.deadline);
    if (!result.ok) return json({ error: result.error }, 400);
    return json({ ok: true });
  } catch (err) {
    console.error("[progress/goal/set] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}