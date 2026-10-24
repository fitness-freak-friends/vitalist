"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

type Props = { mode: "login" | "signup" };

const inputClass =
  "w-full rounded-xl border border-[#14211C]/15 bg-white px-4 py-3 text-sm text-[#14211C] " +
  "placeholder:text-[#14211C]/40 focus:outline focus:outline-2 focus:outline-[#0F2A24]";

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const { error } = isSignup
      ? await signUp.email({ name: String(form.get("name")).trim(), email, password })
      : await signIn.email({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    router.push(isSignup ? "/onboarding":"/");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-[#14211C]">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-[#14211C]/60">
        {isSignup ? "Start tracking your health in a minute." : "Log in to continue your progress."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {isSignup && (
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#14211C]">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#14211C]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#14211C]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
            className={inputClass}
          />
        </div>

        <p role="alert" aria-live="polite" className="min-h-5 text-sm text-red-600">
          {error}
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0F2A24] py-3 text-sm font-medium text-white transition-colors
            hover:bg-[#173d34] disabled:opacity-60
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F2A24]"
        >
          {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[#14211C]/60">
        {isSignup ? "Already have an account? " : "New to Vitalist? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-[#0F2A24] underline underline-offset-4"
        >
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}