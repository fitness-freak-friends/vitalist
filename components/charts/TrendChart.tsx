"use client";

import {
  CartesianGrid, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { SeriesPoint } from "@/lib/progress";

type Props = { points: SeriesPoint[]; label: string; unit: string; target?: number | null };

const shortDate = (t: number) =>
  new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
const fullDate = (t: number) =>
  new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function TrendChart({ points, label, unit, target }: Props) {
  if (points.length === 0) {
    return (
      <div className="grid h-72 place-items-center rounded-2xl bg-[#F3F5F2] text-sm text-[#14211C]/50">
        No {label.toLowerCase()} entries yet. Log one to see your trend.
      </div>
    );
  }

  const data = points.map((p) => ({ t: new Date(p.date).getTime(), value: p.value }));
  const values = data.map((d) => d.value).concat(target != null ? [target] : []);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max((max - min) * 0.15, 1);
  const domain: [number, number] = [Math.floor(min - pad), Math.ceil(max + pad)];

  return (
    <div role="img" aria-label={`${label} trend chart, ${points.length} entries`} className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="#14211C" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="t" type="number" scale="time"
            domain={["dataMin", "dataMax"]} tickFormatter={shortDate}
            tick={{ fontSize: 12, fill: "#14211C99" }} tickLine={false} axisLine={false}
            minTickGap={32}
          />
          <YAxis
            domain={domain} width={44} tickLine={false} axisLine={false}
            tick={{ fontSize: 12, fill: "#14211C99" }}
          />
          <Tooltip
            formatter={(value) => [`${value} ${unit}`, label]}
            labelFormatter={(t) => fullDate(Number(t))}
            contentStyle={{ borderRadius: 12, border: "1px solid #14211C1A", fontSize: 13 }}
          />
          {target != null && (
            <ReferenceLine
              y={target} stroke="#2F9E6E" strokeDasharray="5 4"
              label={{ value: "Goal", position: "insideTopRight", fill: "#2F9E6E", fontSize: 12 }}
            />
          )}
          <Line
            type="monotone" dataKey="value" stroke="#0F2A24" strokeWidth={2.5}
            dot={{ r: 3, fill: "#0F2A24" }} activeDot={{ r: 5 }} isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}