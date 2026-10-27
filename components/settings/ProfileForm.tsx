"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, Field, Status, inputClass, primaryBtn, readError, type Msg } from "./ui";

type Props = {
  initial: {
    name: string; email: string; dateOfBirth: string; gender: string | null;
    heightCm: number | null; activityLevel: string;
  };
};

export default function ProfileForm({ initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [dob, setDob] = useState(initial.dateOfBirth);
  const [gender, setGender] = useState(initial.gender ?? "");
  const [height, setHeight] = useState(initial.heightCm ? String(initial.heightCm) : "");
  const [level, setLevel] = useState(initial.activityLevel);
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, setPending] = useState(false);

  const edit = <T,>(set: (v: T) => void) => (v: T) => { set(v); setMsg(null); };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setPending(true);
    try {
      const res = await fetch("/api/settings/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, dateOfBirth: dob, gender, heightCm: Number(height), activityLevel: level,
        }),
      });
      if (!res.ok) return setMsg({ type: "error", text: await readError(res) });
      setMsg({ type: "ok", text: "Profile saved." });
      router.refresh(); // updates your name in the top bar and greeting
    } catch {
      setMsg({ type: "error", text: "Network error. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card title="Profile" description="Used to personalise your BMI, reports and goals.">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input id="name" required maxLength={60} className={inputClass}
              value={name} onChange={(e) => edit(setName)(e.target.value)} />
          </Field>
          <Field label="Email" htmlFor="email" hint="Email can't be changed yet.">
            <input id="email" disabled value={initial.email}
              className={inputClass + " cursor-not-allowed bg-[#F3F5F2]"} />
          </Field>
          <Field label="Date of birth" htmlFor="dob">
            <input id="dob" type="date" required className={inputClass}
              value={dob} onChange={(e) => edit(setDob)(e.target.value)} />
          </Field>
          <Field label="Gender" htmlFor="gender">
            <select id="gender" required className={inputClass}
              value={gender} onChange={(e) => edit(setGender)(e.target.value)}>
              <option value="" disabled>Select…</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </Field>
          <Field label="Height (cm)" htmlFor="height">
            <input id="height" type="number" required min={100} max={250} step="0.1"
              inputMode="decimal" className={inputClass}
              value={height} onChange={(e) => edit(setHeight)(e.target.value)} />
          </Field>
          <Field label="Activity level" htmlFor="level">
            <select id="level" required className={inputClass}
              value={level} onChange={(e) => edit(setLevel)(e.target.value)}>
              <option value="SEDENTARY">Sedentary: little or no exercise</option>
              <option value="LIGHT">Light: 1–3 days a week</option>
              <option value="MODERATE">Moderate: 3–5 days a week</option>
              <option value="ACTIVE">Active: 6–7 days a week</option>
              <option value="VERY_ACTIVE">Very active: hard exercise or physical job</option>
            </select>
          </Field>
        </div>

        <Status msg={msg} />
        <button type="submit" disabled={pending} className={primaryBtn}>
          {pending ? "Saving…" : "Save profile"}
        </button>
      </form>
    </Card>
  );
}