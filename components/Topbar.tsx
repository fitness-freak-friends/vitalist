"use client";

import { Menu, Search, ChevronDown } from "lucide-react";
import { user } from "@/lib/user";

export default function Topbar({ onToggle }: { onToggle: () => void }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#14211C]/10 bg-white px-4 md:px-6">
      <button
        onClick={onToggle}
        aria-label="Toggle sidebar"
        className="rounded-lg p-2 text-[#14211C] hover:bg-[#14211C]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F2A24]"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative mx-auto w-full max-w-2xl flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#14211C]/50" />
        <input
          type="search"
          placeholder="Search workouts, meals, reports…"
          className="w-full rounded-full bg-[#F3F5F2] py-2.5 pl-10 pr-4 text-sm text-[#14211C] placeholder:text-[#14211C]/50
            focus:outline focus:outline-2 focus:outline-[#0F2A24]"
        />
      </div>

      <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-[#14211C]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F2A24]">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0F2A24] text-sm font-semibold text-[#7CF0C0]">
          {user.name[0]}
        </span>
        <span className="hidden text-sm font-medium text-[#14211C] sm:block">{user.name}</span>
        <ChevronDown className="hidden h-4 w-4 text-[#14211C]/50 sm:block" />
      </button>
    </header>
  );
}