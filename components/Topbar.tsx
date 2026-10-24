"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, ChevronDown, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

type Props = {
  user: { name: string; email: string };
  onMenuClick: () => void;
};

export default function Topbar({ user, onMenuClick }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const firstName = user.name.split(" ")[0];

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#14211C]/10 bg-white px-4 md:px-6">
      {/* Phones only: the sidebar's own toggle is off-screen when it's closed */}
      <button
        onClick={onMenuClick}
        aria-label="Open sidebar"
        className="rounded-lg p-2 text-[#14211C] hover:bg-[#14211C]/5 md:hidden
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F2A24]"
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

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-[#14211C]/5
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F2A24]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0F2A24] text-sm font-semibold uppercase text-[#7CF0C0]">
            {user.name[0]}
          </span>
          <span className="hidden text-sm font-medium text-[#14211C] sm:block">{firstName}</span>
          <ChevronDown
            className={`hidden h-4 w-4 text-[#14211C]/50 transition-transform sm:block ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[#14211C]/10 bg-white p-2 shadow-lg"
          >
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-[#14211C]">{user.name}</p>
              <p className="truncate text-xs text-[#14211C]/60">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-[#14211C]/10" />
            <button
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#14211C] hover:bg-[#14211C]/5 disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}