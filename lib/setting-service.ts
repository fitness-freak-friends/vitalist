import { prisma } from "@/lib/prisma";

export const DEFAULT_GOALS = {
  dailyStepGoal: 8000,
  dailyCalorieGoal: null as number | null,
  dailyWaterGoalMl: 2500,
  weeklyWorkoutGoal: 4,
};

export async function getSettings(userId: string) {
  const [user, goals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true, email: true, dateOfBirth: true,
        gender: true, heightCm: true, activityLevel: true,
      },
    }),
    prisma.userSettings.findUnique({
      where: { userId },
      select: {
        dailyStepGoal: true, dailyCalorieGoal: true,
        dailyWaterGoalMl: true, weeklyWorkoutGoal: true,
      },
    }),
  ]);
  if (!user) return null;

  return {
    profile: {
      ...user,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : "",
    },
    goals: goals ?? DEFAULT_GOALS,
  };
}

export async function updateProfile(
  userId: string,
  d: {
    name: string; dateOfBirth: string; heightCm: number;
    gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
    activityLevel: "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE" | "VERY_ACTIVE";
  },
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: d.name,
      dateOfBirth: new Date(d.dateOfBirth),
      gender: d.gender,
      heightCm: d.heightCm,
      activityLevel: d.activityLevel,
    },
  });
}

export async function updateGoals(
  userId: string,
  d: {
    dailyStepGoal: number; dailyCalorieGoal: number | null;
    dailyWaterGoalMl: number; weeklyWorkoutGoal: number;
  },
) {
  await prisma.userSettings.upsert({
    where: { userId },
    update: d,
    create: { userId, ...d },
  });
}

export async function listUserSessions(userId: string, currentSessionId: string) {
  const rows = await prisma.session.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, ipAddress: true, userAgent: true, createdAt: true, updatedAt: true },
  });
  return rows.map((r) => ({
    id: r.id,
    ipAddress: r.ipAddress,
    userAgent: r.userAgent,
    createdAt: r.createdAt.toISOString(),
    lastActive: r.updatedAt.toISOString(),
    current: r.id === currentSessionId,
  }));
}

export async function revokeUserSession(userId: string, id: string, currentSessionId: string) {
  if (id === currentSessionId) return false;
  const res = await prisma.session.deleteMany({ where: { id, userId } });
  return res.count > 0;
}

export async function revokeOtherUserSessions(userId: string, currentSessionId: string) {
  const res = await prisma.session.deleteMany({
    where: { userId, id: { not: currentSessionId } },
  });
  return res.count;
}