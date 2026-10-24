"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { calcBmi, categoryFor } from "@/lib/bmi";

export type BmiState = { error?: string; saved?: boolean } | null;

export async function saveBmi(_prev: BmiState, formData: FormData): Promise<BmiState> {
  const userId = await requireUserId();

  const heightCm = Number(formData.get("heightCm"));
  const weightKg = Number(formData.get("weightKg"));

  if (!(heightCm >= 100 && heightCm <= 250)) return { error: "Height must be between 100 and 250 cm." };
  if (!(weightKg >= 25 && weightKg <= 400)) return { error: "Weight must be between 25 and 400 kg." };

  const bmi = calcBmi(weightKg, heightCm);

  await prisma.bmiRecord.create({
    data: { userId, weightKg, heightCm, bmi, category: categoryFor(bmi) },
  });

  revalidatePath("/bmi");
  return { saved: true };
}

export async function deleteBmi(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id"));

  await prisma.bmiRecord.deleteMany({ where: { id, userId } });
  revalidatePath("/bmi");
}