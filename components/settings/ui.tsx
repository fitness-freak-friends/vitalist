export const inputClass =
  "w-full rounded-xl border border-[#14211C]/15 bg-white px-4 py-3 text-sm text-[#14211C] " +
  "placeholder:text-[#14211C]/40 focus:outline focus:outline-2 focus:outline-[#0F2A24]";

export const primaryBtn =
  "rounded-xl bg-[#0F2A24] px-6 py-3 text-sm font-medium text-white transition-colors " +
  "hover:bg-[#173d34] disabled:opacity-50 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F2A24]";

export type Msg = { type: "ok" | "error"; text: string } | null;

export async function readError(res: Response) {
  const data = await res.json().catch(() => null);
  return (data?.error as string | undefined) ?? "Something went wrong. Please try again.";
}

export function Card({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-lg font-semibold text-[#14211C]">{title}</h2>
      {description && <p className="mt-1 text-sm text-[#14211C]/60">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Field({ label, htmlFor, hint, children }: {
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

export function Status({ msg }: { msg: Msg }) {
  return (
    <p role="alert" aria-live="polite" className="min-h-5 text-sm">
      {msg && (
        <span className={msg.type === "ok" ? "text-[#2F9E6E]" : "text-red-600"}>{msg.text}</span>
      )}
    </p>
  );
}