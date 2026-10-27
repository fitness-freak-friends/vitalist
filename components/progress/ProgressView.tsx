"use client";

import { useEffect, useState } from "react";
import { Card, readError } from "@/components/settings/ui";
import TrendChart from "@/components/charts/TrendChart";
import GoalCard from "./GoalCard";
import LogMeasurementForm from "./LogMeasurementForm";
import MeasurementHistory from "./MeasurementHistory";
import {
  METRICS, METRIC_INFO, type Metric, type SeriesPoint, type GoalProgress, type MeasurementRow,
} from "@/lib/progress";

type Props = { history: MeasurementRow[]; weightSeries: SeriesPoint[]; goal: GoalProgress | null };

const round1 = (n: number) => Math.round(n * 10) / 10;

export default function ProgressView({ history, weightSeries, goal }: Props) {
  const [metric, setMetric] = useState<Metric>("weightKg");
  const [points, setPoints] = useState<SeriesPoint[]>(weightSeries);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Weight comes from the server render. Other metrics are fetched when selected.
  // When the page refreshes after a save, weightSeries changes and this runs again.
  useEffect(() => {
    if (metric === "weightKg") {
      setPoints(weightSeries);
      setError("");
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/progress/series?metric=${metric}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(await readError(res));
        return res.json();
      })
      .then((d) => setPoints(d.points as SeriesPoint[]))
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(e.message || "Couldn't load this chart.");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [metric, weightSeries]);

  const info = METRIC_INFO[metric];
  const first = points[0];
  const last = points[points.length - 1];
  const change = first && last && first !== last ? round1(last.value - first.value) : null;

  return (
    <div className="mt-6 space-y-6">
      <GoalCard goal={goal} hasWeight={weightSeries.length > 0} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card title="Trends">
            <div className="-mt-2 mb-4 flex gap-2 overflow-x-auto pb-1">
              {METRICS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={metric === m}
                  onClick={() => setMetric(m)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F2A24]
                    ${metric === m ? "bg-[#0F2A24] text-white" : "bg-[#F3F5F2] text-[#14211C]/70 hover:bg-[#14211C]/10"}`}
                >
                  {METRIC_INFO[m].label}
                </button>
              ))}
            </div>

            <p className="mb-3 min-h-5 text-sm text-[#14211C]/70" aria-live="polite" suppressHydrationWarning>
              {error ? (
                <span className="text-red-600">{error}</span>
              ) : loading ? (
                "Loading…"
              ) : last ? (
                <>
                  Latest <strong className="text-[#14211C]">{last.value} {info.unit}</strong>
                  {change !== null && (
                    <>
                      {" · "}
                      {change > 0 ? "+" : ""}{change} {info.unit} since{" "}
                      {new Date(first.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </>
                  )}
                </>
              ) : null}
            </p>

            <TrendChart
              points={points}
              label={info.label}
              unit={info.unit}
              target={metric === "weightKg" && goal ? goal.targetKg : null}
            />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <LogMeasurementForm />
        </div>
      </div>

      <MeasurementHistory items={history} />
    </div>
  );
}