"use client";

import { useActionState } from "react";
import { saveProfile, type FormState } from "./action";

const input =
  "w-full rounded-xl border border-[#14211C]/15 bg-white px-4 py-3 text-sm text-[#14211C] " +
  "placeholder:text-[#14211C]/40 focus:outline focus:outline-2 focus:outline-[#0F2A24]";

function Field({ label, htmlFor, hint, children }: {
  label: string; htmlFor: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-[#14211C]">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-[#14211C]/50">{hint}</p>}
    </div>
  );
}

export default function OnboardingForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile, null);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[#14211C] md:text-3xl">
        Welcome, {name.split(" ")[0]}! 👋
      </h1>
      <p className="mt-2 text-sm text-[#14211C]/60">
        Tell us a little about you so we can personalise your BMI, reports and goals.
      </p>

      <form action={action} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Date of birth" htmlFor="dateOfBirth">
            <input id="dateOfBirth" name="dateOfBirth" type="date" required className={input} />
          </Field>

          <Field label="Gender" htmlFor="gender">
            <select id="gender" name="gender" required defaultValue="" className={input}>
              <option value="" disabled>Select…</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </Field>

          <Field label="Height (cm)" htmlFor="heightCm">
            <input id="heightCm" name="heightCm" type="number" required min={100} max={250}
              step="0.1" inputMode="decimal" placeholder="e.g. 170" className={input} />
          </Field>

          <Field label="Weight (kg)" htmlFor="weightKg">
            <input id="weightKg" name="weightKg" type="number" required min={25} max={400}
              step="0.1" inputMode="decimal" placeholder="e.g. 65" className={input} />
          </Field>
        </div>

        <Field label="Activity level" htmlFor="activityLevel">
          <select id="activityLevel" name="activityLevel" required defaultValue="" className={input}>
            <option value="" disabled>Select…</option>
            <option value="SEDENTARY">Sedentary: little or no exercise</option>
            <option value="LIGHT">Light: exercise 1–3 days a week</option>
            <option value="MODERATE">Moderate: exercise 3–5 days a week</option>
            <option value="ACTIVE">Active: exercise 6–7 days a week</option>
            <option value="VERY_ACTIVE">Very active: hard exercise or physical job</option>
          </select>
        </Field>

        <Field label="Target weight in kg (optional)" htmlFor="targetWeightKg"
          hint="We'll create a weight goal for you to track on the Progress page.">
          <input id="targetWeightKg" name="targetWeightKg" type="number" min={25} max={400}
            step="0.1" inputMode="decimal" placeholder="e.g. 60" className={input} />
        </Field>

        <p role="alert" aria-live="polite" className="min-h-5 text-sm text-red-600">
          {state?.error}
        </p>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-[#0F2A24] py-3 text-sm font-medium text-white transition-colors
            hover:bg-[#173d34] disabled:opacity-60
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F2A24]"
        >
          {pending ? "Saving…" : "Continue to dashboard"}
        </button>
      </form>
    </div>
  );
}