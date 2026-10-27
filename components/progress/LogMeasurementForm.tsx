"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, Field, Status, inputClass, primaryBtn, readError, type Msg } from "@/components/settings/ui";
import { METRICS, METRIC_INFO, type Metric } from "@/lib/progress";

type Values = Record<Metric, string> & { date: string; notes: string };

const empty: Values = {
  weightKg: "", bodyFatPct: "", waistCm: "", chestCm: "",
  hipsCm: "", armCm: "", thighCm: "", date: "", notes: "",
};

function todayLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function LogMeasurementForm() {
  const router = useRouter();
  const [v, setV] = useState<Values>(empty);
  const [today, setToday] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, setPending] = useState(false);

  // Set after mount so server and browser HTML match
  useEffect(() => {
    const t = todayLocal();
    setToday(t);
    setV((p) => ({ ...p, date: t }));
  }, []);

  const set = (k: keyof Values) => (e: { target: { value: string } }) => {
    setV((p) => ({ ...p, [k]: e.target.value }));
    setMsg(null);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body: Record<string, unknown> = {};
    for (const m of METRICS) {
      const raw = v[m].trim();
      if (raw) body[m] = Number(raw);
    }
    if (Object.keys(body).length === 0) {
      return setMsg({ type: "error", text: "Enter at least one measurement." });
    }
    if (v.date) body.measuredAt = v.date;
    if (v.notes.trim()) body.notes = v.notes.trim();

    setMsg(null);
    setPending(true);
    try {
      const res = await fetch("/api/progress/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return setMsg({ type: "error", text: await readError(res) });
      setV((p) => ({ ...empty, date: p.date }));
      setMsg({ type: "ok", text: "Saved." });
      router.refresh();
    } catch {
      setMsg({ type: "error", text: "Network error. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  const numberField = (m: Metric) => (
    <Field key={m} label={`${METRIC_INFO[m].label} (${METRIC_INFO[m].unit})`} htmlFor={m}>
      <input id={m} type="number" min={METRIC_INFO[m].min} max={METRIC_INFO[m].max} step="0.1"
        inputMode="decimal" className={inputClass} value={v[m]} onChange={set(m)} />
    </Field>
  );

  return (
    <Card title="Log measurements" description="Fill in whatever you measured today.">
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Date" htmlFor="date">
          <input id="date" type="date" required max={today || undefined}
            className={inputClass} value={v.date} onChange={set("date")} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          {numberField("weightKg")}
          {numberField("bodyFatPct")}
        </div>

        <details className="rounded-xl bg-[#F3F5F2] p-4">
          <summary className="cursor-pointer text-sm font-medium text-[#14211C]">More body measurements</summary>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {(["waistCm", "chestCm", "hipsCm", "armCm", "thighCm"] as Metric[]).map(numberField)}
          </div>
        </details>

        <Field label="Notes (optional)" htmlFor="notes">
          <input id="notes" maxLength={200} placeholder="e.g. after morning workout"
            className={inputClass} value={v.notes} onChange={set("notes")} />
        </Field>

        <Status msg={msg} />
        <button type="submit" disabled={pending} className={primaryBtn + " w-full"}>
          {pending ? "Saving…" : "Save entry"}
        </button>
      </form>
    </Card>
  );
}