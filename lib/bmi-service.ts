import { prisma } from "@/lib/prisma";
import { calcBmi, categoryFor } from "@/lib/bmi";

const select = {
  id: true, weightKg: true, heightCm: true, bmi: true, category: true, createdAt: true,
} as const;

export async function getBmiHistory(userId: string, take = 20, cursor?: string) {
  const limit = Math.min(Math.max(take, 1), 50);
  const rows = await prisma.bmiRecord.findMany({
    where: { userId },                    
    orderBy: { createdAt: "desc" },
    take: limit + 1,                           
    select,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
}

export async function createBmiRecord(
  userId: string,
  input: { weightKg: number; heightCm: number },
) {
  const bmi = calcBmi(input.weightKg, input.heightCm); 
  return prisma.bmiRecord.create({
    data: { userId, ...input, bmi, category: categoryFor(bmi) },
    select,
  });
}

export async function deleteBmiRecord(userId: string, id: string): Promise<boolean> {
  const res = await prisma.bmiRecord.deleteMany({ where: { id, userId } });
  return res.count > 0;
}