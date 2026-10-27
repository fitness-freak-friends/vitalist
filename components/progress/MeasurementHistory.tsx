"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Card, Status, readError, type Msg } from "@/components/settings/ui";
import { METRICS, METRIC_INFO, type MeasurementRow } from "@/lib/progress";

export default function MeasurementHistory({ items }: { items: MeasurementRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);

  async function onDelete(id: string) {
    setMsg(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/progress/delete/${id}`, { method: "DELETE" });
      if (!res.ok) return setMsg({ type: "error", text: await readError(res) });
      router.refresh();
    } catch {
      setMsg({ type: "error", text: "Network error. Check your connection and try again." });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card title="History" description={items.length >= 20 ? "Showing your latest 20 entries." : undefined}>
      {items.length === 0 ? (
        <p className="text-sm text-[#14211C]/50">No entries yet. Log your first measurement above.</p>
      ) : (
        <ul className="divide-y divide-[#14211C]/10">
          {items.map((r) => (
            <li key={r.id} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#14211C]" suppressHydrationWarning>
                  {new Date(r.measuredAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {METRICS.filter((m) => r[m] != null).map((m) => (
                    <span key={m} className="rounded-full bg-[#F3F5F2] px-3 py-1 text-xs text-[#14211C]/80">
                      {METRIC_INFO[m].label} {r[m]} {METRIC_INFO[m].unit}
                    </span>
                  ))}
                </div>
                {r.notes && <p className="mt-1.5 text-xs text-[#14211C]/50">{r.notes}</p>}
              </div>
              <button
                type="button" onClick={() => onDelete(r.id)} disabled={deletingId === r.id}
                aria-label="Delete this entry"
                className="rounded-lg p-2 text-[#14211C]/40 hover:bg-red-50 hover:text-red-600 disabled:opacity-40
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F2A24]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2"><Status msg={msg} /></div>
    </Card>
  );
}