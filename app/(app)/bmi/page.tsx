import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getBmiHistory } from "@/lib/bmi-service";
import BmiCalculator from "@/components/BmiCalculator";
import type { BmiCategory } from "@/lib/bmi";

export const metadata = { title: "BMI Calculator · Vitalist" };

export default async function BmiPage() {
  const userId = await requireUserId();

  const [user, { items }] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { heightCm: true } }),
    getBmiHistory(userId, 20),
  ]);

  const history = items.map((r) => ({
    id: r.id,
    weightKg: r.weightKg,
    heightCm: r.heightCm,
    bmi: r.bmi,
    category: r.category as BmiCategory,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-[#14211C] md:text-3xl">
        BMI Calculator
      </h1>
      <p className="mt-1 text-sm text-[#14211C]/60">
        Check your body mass index and track how it changes over time.
      </p>

      <BmiCalculator
        defaultHeight={user?.heightCm ?? history[0]?.heightCm ?? null}
        defaultWeight={history[0]?.weightKg ?? null}
        history={history}
      />
    </div>
  );
}