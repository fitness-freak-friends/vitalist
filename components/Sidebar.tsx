"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { navItems } from "@/lib/nav";

type Props = { open: boolean; onNavigate: () => void };

export default function Sidebar({ open, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0F2A24] text-white
        transition-[width,transform] duration-300 ease-out md:static
        ${open ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-[76px] md:translate-x-0"}`}
    >
      <div className="flex h-16 items-center gap-3 px-5">
        <Activity className="h-6 w-6 shrink-0 text-[#7CF0C0]" />
        <span className={`text-xl font-semibold tracking-tight ${open ? "" : "md:hidden"}`}>
          Vitalist
        </span>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7CF0C0]
                ${active ? "bg-[#7CF0C0] text-[#0F2A24]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={open ? "" : "md:hidden"}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}