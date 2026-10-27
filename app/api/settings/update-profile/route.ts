import { z } from "zod";
import { getSession } from "@/lib/session";
import { json, isSameOrigin, rateLimit } from "@/lib/security";
import { updateProfile } from "@/lib/setting-service";

function ageOf(dob: string) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
  return age;
}

const schema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(60, "Name is too long."),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date of birth."),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], { message: "Choose a gender option." }),
    heightCm: z.number().min(100, "Height must be between 100 and 250 cm.").max(250, "Height must be between 100 and 250 cm."),
    activityLevel: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"], { message: "Choose an activity level." }),
  })
  .strict() 
  .refine((v) => { const a = ageOf(v.dateOfBirth); return a >= 13 && a <= 120; },
    { message: "You must be between 13 and 120 years old.", path: ["dateOfBirth"] });

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
    await updateProfile(userId, parsed.data);
    return json({ ok: true });
  } catch (err) {
    console.error("[settings/update-profile] failed:", err);
    return json({ error: "Something went wrong." }, 500);
  }
}