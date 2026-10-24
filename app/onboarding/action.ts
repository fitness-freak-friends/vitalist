"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] as const;
const LEVELS = ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"] as const;
type G = (typeof GENDERS)[number];
type L = (typeof LEVELS)[number];

export type FormState = { error?: string } | null;

function bmiCategory(bmi: number): "UNDERWEIGHT" | "NORMAL" | "OVERWEIGHT" | "OBESE" {
  if (bmi < 18.5) return "UNDERWEIGHT";
  if (bmi < 25) return "NORMAL";
  if (bmi < 30) return "OVERWEIGHT";
  return "OBESE";
}

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) redirect("/login");
  const userId = session.user.id;

  const dob = new Date(String(formData.get("dateOfBirth")));
  const gender = String(formData.get("gender"));
  const activityLevel = String(formData.get("activityLevel"));
  const heightCm = Number(formData.get("heightCm"));
  const weightKg = Number(formData.get("weightKg"));
  const targetRaw = String(formData.get("targetWeightKg") ?? "").trim();
  const targetWeightKg = targetRaw ? Number(targetRaw) : null;

  // Validate on the server: never trust the browser
  if (Number.isNaN(dob.getTime())) return { error: "Please enter a valid date of birth." };
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  if (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate())) age--;
  if (age < 13 || age > 120) return { error: "You must be between 13 and 120 years old." };

  if (!GENDERS.includes(gender as G)) return { error: "Please choose a gender option." };
  if (!LEVELS.includes(activityLevel as L)) return { error: "Please choose an activity level." };
  if (!(heightCm >= 100 && heightCm <= 250)) return { error: "Height must be between 100 and 250 cm." };
  if (!(weightKg >= 25 && weightKg <= 400)) return { error: "Weight must be between 25 and 400 kg." };
  if (targetWeightKg !== null && !(targetWeightKg >= 25 && targetWeightKg <= 400)) {
    return { error: "Target weight must be between 25 and 400 kg." };
  }

  const bmi = Math.round((weightKg / (heightCm / 100) ** 2) * 10) / 10;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        dateOfBirth: dob,
        gender: gender as G,
        heightCm,
        activityLevel: activityLevel as L,
        onboardingCompleted: true,
      },
    });
    // First data points for Progress and BMI history
    await tx.bodyMeasurement.create({ data: { userId, weightKg } });
    await tx.bmiRecord.create({
      data: { userId, weightKg, heightCm, bmi, category: bmiCategory(bmi) },
    });
    await tx.userSettings.upsert({ where: { userId }, update: {}, create: { userId } });
    if (targetWeightKg !== null) {
      await tx.goal.create({
        data: {
          userId,
          type: "WEIGHT",
          title: "Reach target weight",
          startValue: weightKg,
          currentValue: weightKg,
          targetValue: targetWeightKg,
          unit: "kg",
        },
      });
    }
  });

  redirect("/");
}