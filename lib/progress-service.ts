import { prisma } from "@/lib/prisma";
import { METRICS, type Metric, type SeriesPoint, type GoalProgress } from "@/lib/progress";

const select = {
  id: true, measuredAt: true, notes: true,
  weightKg: true, bodyFatPct: true, waistCm: true,
  chestCm: true, hipsCm: true, armCm: true, thighCm: true,
} as const;

const round1 = (n: number) => Math.round(n * 10) / 10;
const noonUtc = (d: string) => new Date(`${d}T12:00:00.000Z`);

export async function getMeasurementHistory(userId: string, take = 20, cursor?: string) {
  const limit = Math.min(Math.max(take, 1), 50);
  const rows = await prisma.bodyMeasurement.findMany({
    where: { userId },                                   // always scoped to the user
    orderBy: [{ measuredAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
}

// Points for one metric, oldest first, at most 365
export async function getSeries(userId: string, metric: Metric, limit = 365): Promise<SeriesPoint[]> {
  const rows = await prisma.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { measuredAt: "desc" },
    take: 1000,
    select,
  });
  return rows
    .filter((r) => r[metric] != null)
    .slice(0, limit)
    .reverse()
    .map((r) => ({ date: r.measuredAt.toISOString(), value: r[metric] as number }));
}

export type MeasurementInput = Partial<Record<Metric, number>> & {
  measuredAt?: string;
  notes?: string;
};

export async function createMeasurement(userId: string, input: MeasurementInput) {
  return prisma.bodyMeasurement.create({
    data: {
      userId,
      weightKg: input.weightKg,
      bodyFatPct: input.bodyFatPct,
      waistCm: input.waistCm,
      chestCm: input.chestCm,
      hipsCm: input.hipsCm,
      armCm: input.armCm,
      thighCm: input.thighCm,
      measuredAt: input.measuredAt ? noonUtc(input.measuredAt) : new Date(),
      notes: input.notes || null,
    },
    select,
  });
}

// Matches id AND userId, so you can never delete someone else's row
export async function deleteMeasurement(userId: string, id: string) {
  const res = await prisma.bodyMeasurement.deleteMany({ where: { id, userId } });
  return res.count > 0;
}

async function latestWeight(userId: string) {
  const row = await prisma.bodyMeasurement.findFirst({
    where: { userId, weightKg: { not: null } },
    orderBy: { measuredAt: "desc" },
    select: { weightKg: true },
  });
  return row?.weightKg ?? null;
}

export async function getGoalProgress(userId: string): Promise<GoalProgress | null> {
  const [goal, latest] = await Promise.all([
    prisma.goal.findFirst({
      where: { userId, type: "WEIGHT", status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    latestWeight(userId),
  ]);
  if (!goal) return null;

  const start = goal.startValue ?? latest ?? goal.targetValue;
  const current = latest ?? start;
  const target = goal.targetValue;
  const total = start - target;
  const raw = total === 0 ? 1 : (start - current) / total;

  return {
    id: goal.id,
    startKg: round1(start),
    targetKg: round1(target),
    currentKg: round1(current),
    progressPct: Math.round(Math.min(Math.max(raw, 0), 1) * 100),
    direction: target < start ? "lose" : "gain",
    deadline: goal.deadline ? goal.deadline.toISOString().slice(0, 10) : null,
  };
}

export async function setWeightGoal(
  userId: string,
  targetKg: number,
  deadline?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const latest = await latestWeight(userId);
  if (latest == null) {
    return { ok: false, error: "Log your weight first, so we know where you're starting from." };
  }
  if (Math.abs(latest - targetKg) < 0.1) {
    return { ok: false, error: "Target must be different from your current weight." };
  }

  await prisma.$transaction([
    prisma.goal.updateMany({
      where: { userId, type: "WEIGHT", status: "ACTIVE" },
      data: { status: "ABANDONED" },
    }),
    prisma.goal.create({
      data: {
        userId,
        type: "WEIGHT",
        title: "Reach target weight",
        startValue: latest,
        currentValue: latest,
        targetValue: targetKg,
        unit: "kg",
        deadline: deadline ? new Date(`${deadline}T00:00:00.000Z`) : null,
      },
    }),
  ]);
  return { ok: true };
}

export async function removeWeightGoal(userId: string) {
  const res = await prisma.goal.updateMany({
    where: { userId, type: "WEIGHT", status: "ACTIVE" },
    data: { status: "ABANDONED" },
  });
  return res.count > 0;
}

export { METRICS };