"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Monitor } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Card, Field, Status, inputClass, primaryBtn, readError, type Msg } from "./ui";

type SessionRow = {
  id: string; ipAddress: string | null; userAgent: string | null;
  createdAt: string; lastActive: string; current: boolean;
};

function describe(ua: string | null) {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera"
    : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android"
    : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux" : "Unknown OS";
  return `${browser} on ${os}`;
}

export default function SecuritySection({ sessions }: { sessions: SessionRow[] }) {
  const router = useRouter();

  // Password form
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [revokeOthers, setRevokeOthers] = useState(true);
  const [pwMsg, setPwMsg] = useState<Msg>(null);
  const [pwPending, setPwPending] = useState(false);

  // Sessions
  const [sessMsg, setSessMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function onChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwMsg(null);
    if (next.length < 8) return setPwMsg({ type: "error", text: "New password must be at least 8 characters." });
    if (next !== confirm) return setPwMsg({ type: "error", text: "New passwords don't match." });
    if (next === current) return setPwMsg({ type: "error", text: "New password must be different from the current one." });

    setPwPending(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: revokeOthers,
      });
      if (error) return setPwMsg({ type: "error", text: error.message ?? "Couldn't change the password." });
      setCurrent(""); setNext(""); setConfirm("");
      setPwMsg({ type: "ok", text: "Password updated." });
      router.refresh();
    } catch {
      setPwMsg({ type: "error", text: "Network error. Check your connection and try again." });
    } finally {
      setPwPending(false);
    }
  }

  async function revoke(url: string, key: string, okText: string) {
    setSessMsg(null);
    setBusy(key);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) return setSessMsg({ type: "error", text: await readError(res) });
      setSessMsg({ type: "ok", text: okText });
      router.refresh();
    } catch {
      setSessMsg({ type: "error", text: "Network error. Check your connection and try again." });
    } finally {
      setBusy(null);
    }
  }

  const others = sessions.filter((s) => !s.current).length;

  return (
    <>
      <Card title="Change password" description="You'll need your current password.">
        <form onSubmit={onChangePassword} className="space-y-5">
          <Field label="Current password" htmlFor="cur">
            <input id="cur" type="password" required autoComplete="current-password" className={inputClass}
              value={current} onChange={(e) => { setCurrent(e.target.value); setPwMsg(null); }} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="New password" htmlFor="new" hint="At least 8 characters.">
              <input id="new" type="password" required minLength={8} autoComplete="new-password" className={inputClass}
                value={next} onChange={(e) => { setNext(e.target.value); setPwMsg(null); }} />
            </Field>
            <Field label="Confirm new password" htmlFor="conf">
              <input id="conf" type="password" required minLength={8} autoComplete="new-password" className={inputClass}
                value={confirm} onChange={(e) => { setConfirm(e.target.value); setPwMsg(null); }} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#14211C]">
            <input type="checkbox" checked={revokeOthers} onChange={(e) => setRevokeOthers(e.target.checked)}
              className="h-4 w-4 accent-[#0F2A24]" />
            Log me out of all my other devices
          </label>

          <Status msg={pwMsg} />
          <button type="submit" disabled={pwPending} className={primaryBtn}>
            {pwPending ? "Updating…" : "Update password"}
          </button>
        </form>
      </Card>

      <Card title="Active sessions" description="Devices where you're currently logged in. Log out of any you don't recognise.">
        <ul className="divide-y divide-[#14211C]/10">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F3F5F2] text-[#0F2A24]">
                <Monitor className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#14211C]">
                  {describe(s.userAgent)}
                  {s.current && (
                    <span className="ml-2 rounded-full bg-[#7CF0C0] px-2 py-0.5 text-xs font-medium text-[#0F2A24]">
                      This device
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-[#14211C]/50" suppressHydrationWarning>
                  {s.ipAddress ?? "IP unknown"} · Last active{" "}
                  {new Date(s.lastActive).toLocaleString(undefined, {
                    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                  })}
                </p>
              </div>
              {!s.current && (
                <button
                  type="button"
                  disabled={busy === s.id}
                  onClick={() => revoke(`/api/settings/revoke-session/${s.id}`, s.id, "Device logged out.")}
                  className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-40
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F2A24]"
                >
                  Log out
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-3">
          <Status msg={sessMsg} />
          {others > 0 && (
            <button
              type="button"
              disabled={busy === "all"}
              onClick={() => revoke("/api/settings/revoke-other-sessions", "all", "Logged out of all other devices.")}
              className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F2A24]"
            >
              Log out of all other devices
            </button>
          )}
        </div>
      </Card>
    </>
  );
}