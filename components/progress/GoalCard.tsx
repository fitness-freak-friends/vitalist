"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, Field, Status, inputClass, primaryBtn, readError, type Msg } from "@/components/settings/ui";
import type { GoalProgress } from "@/lib/progress";

export default function GoalCard({ goal, hasWeight }: { goal: GoalProgress | null; hasWeight: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState(goal ? String(goal.targetKg) : "");
  const [deadline, setDeadline] = useState(goal?.deadline ?? "");
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, setPending] = useState(false);

  const showForm = !goal || editing;

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setPending(true);
    try {
      const res = await fetch("/api/progress/goal/set", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetKg: Number(target), deadline: deadline || undefined }),
      });
      if (!res.ok) return setMsg({ type: "error", text: await readError(res) });
      setEditing(false);
      router.refresh();
    } catch {
      setMsg({ type: "error", text: "Network error. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  async function onRemove() {
    setMsg(null);
    setPending(true);
    try {
      const res = await fetch("/api/progress/goal/delete", { method: "DELETE" });
      if (!res.ok) return setMsg({ type: "error", text: await readError(res) });
      setTarget(""); setDeadline(""); setEditing(false);
      router.refresh();
    } catch {
      setMsg({ type: "error", text: "Network error. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card
      title="Weight goal"
      description={goal ? undefined : "Set a target and we'll track your progress from your latest weight."}
    >
      {goal && !editing && (
        <div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-sm text-[#14211C]/70">
              <strong className="text-2xl font-semibold text-[#14211C]">{goal.currentKg} kg</strong>
              {"  "}→ {goal.targetKg} kg goal
            </p>
            <p className="text-sm font-medium text-[#14211C]">{goal.progressPct}%</p>
          </div>

          <div
            role="progressbar" aria-label="Weight goal progress"
            aria-valuenow={goal.progressPct} aria-valuemin={0} aria-valuemax={100}
            className="mt-3 h-3 overflow-hidden rounded-full bg-[#F3F5F2]"
          >
            <div
              className="h-full rounded-full bg-[#2F9E6E] transition-[width] duration-500"
              style={{ width: `${goal.progressPct}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-[#14211C]/60" suppressHydrationWarning>
            Started at {goal.startKg} kg · {goal.direction === "lose" ? "Losing" : "Gaining"} weight
            {goal.deadline &&
              ` · By ${new Date(`${goal.deadline}T12:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
          {goal.progressPct === 100 && (
            <p className="mt-2 text-sm font-medium text-[#2F9E6E]">Goal reached! Set a new target whenever you&apos;re ready.</p>
          )}

          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => setEditing(true)}
              className="rounded-xl border border-[#14211C]/15 px-4 py-2 text-sm font-medium text-[#14211C] hover:bg-[#14211C]/5">
              Change goal
            </button>
            <button type="button" onClick={onRemove} disabled={pending}
              className="rounded-xl px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
              Remove
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={onSave} className="space-y-5">
          {!hasWeight && (
            <p className="rounded-xl bg-[#F3F5F2] p-3 text-sm text-[#14211C]/70">
              Log your weight below first, so we know where you&apos;re starting from.
            </p>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Target weight (kg)" htmlFor="goalTarget">
              <input id="goalTarget" type="number" required min={25} max={400} step="0.1"
                inputMode="decimal" placeholder="e.g. 65" className={inputClass}
                value={target} onChange={(e) => { setTarget(e.target.value); setMsg(null); }} />
            </Field>
            <Field label="Deadline (optional)" htmlFor="goalDeadline">
              <input id="goalDeadline" type="date" className={inputClass}
                value={deadline} onChange={(e) => { setDeadline(e.target.value); setMsg(null); }} />
            </Field>
          </div>
          {goal && (
            <p className="text-xs text-[#14211C]/50">
              Saving a new goal restarts your progress from your current weight.
            </p>
          )}
          <Status msg={msg} />
          <div className="flex gap-3">
            <button type="submit" disabled={pending || !hasWeight} className={primaryBtn}>
              {pending ? "Saving…" : "Save goal"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(false); setMsg(null); }}
                className="rounded-xl px-4 py-3 text-sm font-medium text-[#14211C]/70 hover:bg-[#14211C]/5">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {!showForm && <div className="mt-2"><Status msg={msg} /></div>}
    </Card>
  );
}