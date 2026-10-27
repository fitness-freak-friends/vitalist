import { requireUserId } from "@/lib/session";
import { getMeasurementHistory, getSeries, getGoalProgress } from "@/lib/progress-service";
import type { MeasurementRow } from "@/lib/progress";
import ProgressView from "@/components/progress/ProgressView";

export const metadata = { title: "Progress · Vitalist" };

export default async function ProgressPage() {
  const userId = await requireUserId();

  const [{ items }, weightSeries, goal] = await Promise.all([
    getMeasurementHistory(userId, 20),
    getSeries(userId, "weightKg"),
    getGoalProgress(userId),
  ]);

  const history: MeasurementRow[] = items.map((r) => ({
    ...r,
    measuredAt: r.measuredAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-[#14211C] md:text-3xl">Progress</h1>
      <p className="mt-1 text-sm text-[#14211C]/60">
        Log your measurements, watch your trends and track your weight goal.
      </p>
      <ProgressView history={history} weightSeries={weightSeries} goal={goal} />
    </div>
  );
}