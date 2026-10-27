"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, Field, Status, inputClass, primaryBtn, readError, type Msg } from "./ui";

type Props = {
  initial: {
    dailyStepGoal: number; dailyCalorieGoal: number | null;
    dailyWaterGoalMl: number; weeklyWorkoutGoal: number;
  };
};

export default function GoalsForm({ initial }: Props) {
  const router = useRouter();
  const [steps, setSteps] = useState(String(initial.dailyStepGoal));
  const [calories, setCalories] = useState(initial.dailyCalorieGoal ? String(initial.dailyCalorieGoal) : "");
  const [water, setWater] = useState(String(initial.dailyWaterGoalMl));
  const [workouts, setWorkouts] = useState(String(initial.weeklyWorkoutGoal));
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, setPending] = useState(false);

  const edit = (set: (v: string) => void) => (v: string) => { set(v); setMsg(null); };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setPending(true);
    try {
      const res = await fetch("/api/settings/update-goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyStepGoal: Number(steps),
          dailyCalorieGoal: calories.trim() ? Number(calories) : null,
          dailyWaterGoalMl: Number(water),
          weeklyWorkoutGoal: Number(workouts),
        }),
      });
      if (!res.ok) return setMsg({ type: "error", text: await readError(res) });
      setMsg({ type: "ok", text: "Goals saved." });
      router.refresh();
    } catch {
      setMsg({ type: "error", text: "Network error. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card title="Daily goals" description="The dashboard will measure your progress against these.">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Steps per day" htmlFor="steps">
            <input id="steps" type="number" required min={1000} max={100000} step={500}
              inputMode="numeric" className={inputClass}
              value={steps} onChange={(e) => edit(setSteps)(e.target.value)} />
          </Field>
          <Field label="Calories per day (optional)" htmlFor="calories">
            <input id="calories" type="number" min={800} max={10000} step={50}
              inputMode="numeric" placeholder="e.g. 2000" className={inputClass}
              value={calories} onChange={(e) => edit(setCalories)(e.target.value)} />
          </Field>
          <Field label="Water per day (ml)" htmlFor="water">
            <input id="water" type="number" required min={500} max={10000} step={100}
              inputMode="numeric" className={inputClass}
              value={water} onChange={(e) => edit(setWater)(e.target.value)} />
          </Field>
          <Field label="Workouts per week" htmlFor="workouts">
            <input id="workouts" type="number" required min={1} max={14}
              inputMode="numeric" className={inputClass}
              value={workouts} onChange={(e) => edit(setWorkouts)(e.target.value)} />
          </Field>
        </div>

        <Status msg={msg} />
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? "Saving…" : "Save goals"}
        </button>
      </form>
    </Card>
  );
}