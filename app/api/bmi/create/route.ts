import { z } from "zod";
import { getSession } from "@/lib/session";
import { json, isSameOrigin, rateLimit } from "@/lib/security";
import { createBmiRecord } from "@/lib/bmi-service";

const bodySchema = z.object({
  heightCm: z
    .number()
    .min(100, "Height must be between 100 and 250 cm.")
    .max(250, "Height must be between 100 and 250 cm."),
  weightKg: z
    .number()
    .min(25, "Weight must be between 25 and 400 kg.")
    .max(400, "Weight must be between 25 and 400 kg."),
});

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);

  const session = await getSession();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const userId = session.user.id;

  const rl = rateLimit(`bmi:write:${userId}`, 30, 60_000);
  if (!rl.ok) return json({ error: "Too many requests." }, 429, { "Retry-After": String(rl.retryAfter) });

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Unsupported content type." }, 415);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, 400);
  }

  try {
    return json(await createBmiRecord(userId, parsed.data), 201);
  } catch (err) {
    console.error("[bmi/create] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}