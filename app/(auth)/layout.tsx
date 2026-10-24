import { Activity } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[#F3F5F2] lg:grid-cols-2">
      {/* Brand panel (large screens only) */}
      <aside className="relative hidden overflow-hidden bg-[#0F2A24] p-12 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <Activity className="h-7 w-7 text-[#7CF0C0]" />
          <span className="text-2xl font-semibold tracking-tight">Vitalist</span>
        </div>

        <div className="mt-auto max-w-md pb-32">
          <p className="font-[family-name:var(--font-hand)] text-5xl leading-tight text-[#7CF0C0]">
            Better Health, Happier You
          </p>
          <p className="mt-4 text-white/70">
            Track workouts, meals, and your body&apos;s progress in one place.
          </p>
        </div>

        <svg
          viewBox="0 0 600 120"
          preserveAspectRatio="none"
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-28 w-full"
        >
          <path
            className="vitalist-pulse"
            d="M0 70 H180 L200 70 L215 25 L235 105 L250 50 L262 70 H380 L395 70 L410 40 L425 90 L437 70 H600"
            fill="none"
            stroke="#7CF0C0"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </aside>

      {/* Form side */}
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Activity className="h-6 w-6 text-[#0F2A24]" />
            <span className="text-xl font-semibold tracking-tight text-[#0F2A24]">Vitalist</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}