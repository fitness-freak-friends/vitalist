"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  // Start collapsed on phones
  useEffect(() => {
    if (window.innerWidth < 768) setOpen(false);
  }, []);

  const closeOnMobile = () => {
    if (window.innerWidth < 768) setOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F5F2]">
      <Sidebar open={open} onNavigate={closeOnMobile} />
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggle={() => setOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}