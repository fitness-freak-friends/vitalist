import { z } from "zod";
import { getSession } from "@/lib/session";
import { json, isSameOrigin, rateLimit } from "@/lib/security";
import { updateGoals } from "@/lib/setting-service";

const schema = z
  .object({
    dailyStepGoal: z.number().int().min(1000, "Steps must be between 1,000 and 100,000.").max(100000, "Steps must be between 1,000 and 100,000."),
    dailyCalorieGoal: z.number().int().min(800, "Calories must be between 800 and 10,000.").max(10000, "Calories must be between 800 and 10,000.").nullable(),
    dailyWaterGoalMl: z.number().int().min(500, "Water must be between 500 and 10,000 ml.").max(10000, "Water must be between 500 and 10,000 ml."),
    weeklyWorkoutGoal: z.number().int().min(1, "Workouts per week must be between 1 and 14.").max(14, "Workouts per week must be between 1 and 14."),
  })
  .strict();

export async function PATCH(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);

  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;

  const rl = rateLimit(`settings:write:${userId}`, 20, 60_000);
  if (!rl.ok) return json({ error: "Too many requests." }, 429, { "Retry-After": String(rl.retryAfter) });

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Unsupported content type." }, 415);
  }

  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON." }, 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, 400);

  try {
    await updateGoals(userId, parsed.data);
    return json({ ok: true });
  } catch (err) {
    console.error("[settings/update-goals] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}