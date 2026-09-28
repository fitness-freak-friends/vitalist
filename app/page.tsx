import GreetingBanner from "@/components/GreetingBanner";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <GreetingBanner />
      {/* Blank for now: dashboard widgets go here */}
      <div className="grid min-h-64 place-items-center rounded-3xl border-2 border-dashed border-[#14211C]/15 text-sm text-[#14211C]/50">
        Your dashboard widgets will live here.
      </div>
    </div>
  );
}