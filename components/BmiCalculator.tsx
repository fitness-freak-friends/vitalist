"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { saveBmi, deleteBmi, type BmiState } from "@/app/(app)/bmi/actions";
import {
  calcBmi, categoryFor, healthyRangeKg, CATEGORY_INFO, type BmiCategory,
} from "@/lib/bmi";

type Row = {
  id: string; weightKg: number; heightCm: number; bmi: number;
  category: BmiCategory; createdAt: string;
};

type Props = {
  defaultHeight: number | null;
  defaultWeight: number | null;
  history: Row[];
};

const input =
  "w-full rounded-xl border border-[#14211C]/15 bg-white px-4 py-3 text-sm text-[#14211C] " +
  "placeholder:text-[#14211C]/40 focus:outline focus:outline-2 focus:outline-[#0F2A24]";

// Gauge scale: BMI 15 to 40, split at 18.5 / 25 / 30
const MIN = 15;
const MAX = 40;
const SEGMENTS: { cat: BmiCategory; from: number; to: number }[] = [
  { cat: "UNDERWEIGHT", from: 15, to: 18.5 },
  { cat: "NORMAL", from: 18.5, to: 25 },
  { cat: "OVERWEIGHT", from: 25, to: 30 },
  { cat: "OBESE", from: 30, to: 40 },
];

export default function BmiCalculator({ defaultHeight, defaultWeight, history }: Props) {
  const [height, setHeight] = useState(defaultHeight ? String(defaultHeight) : "");
  const [weight, setWeight] = useState(defaultWeight ? String(defaultWeight) : "");
  const [state, action, pending] = useActionState<BmiState, FormData>(saveBmi, null);

  const h = Number(height);
  const w = Number(weight);
  const valid = h >= 100 && h <= 250 && w >= 25 && w <= 400;
  const bmi = valid ? calcBmi(w, h) : null;
  const info = bmi !== null ? CATEGORY_INFO[categoryFor(bmi)] : null;
  const range = valid ? healthyRangeKg(h) : null;
  const markerPct =
    bmi !== null ? ((Math.min(Math.max(bmi, MIN), MAX) - MIN) / (MAX - MIN)) * 100 : 0;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-5">
      {/* Calculator */}
      <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8 lg:col-span-3">
        <form action={action} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="heightCm" className="mb-1.5 block text-sm font-medium text-[#14211C]">
                Height (cm)
              </label>
              <input
                id="heightCm" name="heightCm" type="number" required min={100} max={250}
                step="0.1" inputMode="decimal" placeholder="e.g. 170" className={input}
                value={height} onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="weightKg" className="mb-1.5 block text-sm font-medium text-[#14211C]">
                Weight (kg)
              </label>
              <input
                id="weightKg" name="weightKg" type="number" required min={25} max={400}
                step="0.1" inputMode="decimal" placeholder="e.g. 65" className={input}
                value={weight} onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          {/* Live result */}
          <div className="rounded-2xl bg-[#F3F5F2] p-5" aria-live="polite">
            {bmi !== null && info ? (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#14211C]/50">Your BMI</p>
                    <p className="text-5xl font-semibold tracking-tight text-[#14211C]">{bmi}</p>
                  </div>
                  <span
                    className="rounded-full px-4 py-1.5 text-sm font-medium text-white"
                    style={{ backgroundColor: info.color }}
                  >
                    {info.label}
                  </span>
                </div>

                {/* Gauge */}
                <div className="relative mt-6">
                  <div className="flex h-3 overflow-hidden rounded-full">
                    {SEGMENTS.map((s) => (
                      <div
                        key={s.cat}
                        style={{
                          width: `${((s.to - s.from) / (MAX - MIN)) * 100}%`,
                          backgroundColor: CATEGORY_INFO[s.cat].color,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    className="absolute -top-1.5 h-6 w-1.5 -translate-x-1/2 rounded-full bg-[#14211C] ring-2 ring-white transition-[left] duration-300"
                    style={{ left: `${markerPct}%` }}
                  />
                  <div className="mt-2 flex justify-between text-[11px] text-[#14211C]/50">
                    <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-[#14211C]/70">{info.note}</p>
                {range && (
                  <p className="mt-2 text-sm text-[#14211C]/70">
                    A healthy weight for your height is about{" "}
                    <strong className="text-[#14211C]">{range[0]}–{range[1]} kg</strong>.
                  </p>
                )}
              </>
            ) : (
              <p className="py-6 text-center text-sm text-[#14211C]/50">
                Enter your height and weight to see your BMI.
              </p>
            )}
          </div>

          <p role="alert" aria-live="polite" className="min-h-5 text-sm">
            {state?.error && <span className="text-red-600">{state.error}</span>}
            {state?.saved && !state.error && <span className="text-[#2F9E6E]">Saved to your history.</span>}
          </p>

          <button
            type="submit"
            disabled={pending || !valid}
            className="w-full rounded-xl bg-[#0F2A24] py-3 text-sm font-medium text-white transition-colors
              hover:bg-[#173d34] disabled:opacity-50
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F2A24]"
          >
            {pending ? "Saving…" : "Save to history"}
          </button>

          <p className="text-xs text-[#14211C]/50">
            BMI is a general screening measure and doesn&apos;t account for muscle mass, age or body
            composition. It isn&apos;t a medical diagnosis.
          </p>
        </form>
      </section>

      {/* History */}
      <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
        <h2 className="text-lg font-semibold text-[#14211C]">History</h2>

        {history.length === 0 ? (
          <p className="mt-6 text-sm text-[#14211C]/50">
            No records yet. Save a result and it will show up here.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[#14211C]/10">
            {history.map((r) => {
              const i = CATEGORY_INFO[r.category];
              return (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: i.color }}
                  >
                    {r.bmi}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#14211C]">
                      {i.label} · {r.weightKg} kg
                    </p>
                    <p className="text-xs text-[#14211C]/50" suppressHydrationWarning>
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        day: "numeric", month: "short", year: "numeric",
                      })}{" "}
                      · {r.heightCm} cm
                    </p>
                  </div>
                  <form action={deleteBmi}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      aria-label="Delete this record"
                      className="rounded-lg p-2 text-[#14211C]/40 hover:bg-red-50 hover:text-red-600
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F2A24]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}