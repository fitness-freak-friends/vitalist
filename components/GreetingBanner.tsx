"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { user } from "@/lib/user";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Leaf({ x, y, r, s = 1, fill }: { x: number; y: number; r: number; s?: number; fill: string }) {
  return (
    <path
      d="M0 0 C-10 -26 10 -50 0 -70 C22 -52 22 -20 0 0Z"
      transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
      fill={fill}
    />
  );
}

function Runner() {
  const skin = "#E9B98F";
  const shirt = "#2F7D4F";
  const dark = "#1F2937";
  return (
    <svg viewBox="0 0 170 190" className="h-full w-auto" aria-hidden>
      {/* back arm */}
      <polyline points="80,64 58,80 50,58" fill="none" stroke={skin} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      {/* back leg */}
      <polyline points="66,108 48,138 22,146" fill="none" stroke={skin} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="18" cy="150" rx="11" ry="5" fill="#fff" />
      {/* front leg */}
      <polyline points="72,108 102,126 98,158" fill="none" stroke={skin} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="106" cy="163" rx="12" ry="5" fill="#fff" />
      {/* shorts */}
      <line x1="70" y1="98" x2="88" y2="116" stroke={dark} strokeWidth="24" strokeLinecap="round" />
      <line x1="68" y1="104" x2="54" y2="124" stroke={dark} strokeWidth="18" strokeLinecap="round" />
      {/* torso */}
      <line x1="86" y1="58" x2="70" y2="98" stroke={shirt} strokeWidth="28" strokeLinecap="round" />
      {/* front arm */}
      <polyline points="92,64 114,86 132,70" fill="none" stroke={skin} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="90" y1="64" x2="102" y2="76" stroke={shirt} strokeWidth="13" strokeLinecap="round" />
      {/* head + hair */}
      <circle cx="90" cy="34" r="15" fill={skin} />
      <path d="M74 33 Q75 14 93 16 Q106 19 104 31 Q94 22 82 31 Z" fill={dark} />
    </svg>
  );
}

export default function GreetingBanner() {
  // Set after mount so server and client HTML match
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const greeting = now ? greetingFor(now.getHours()) : "Welcome back";
  const date = now
    ? `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`
    : "\u00A0";

  return (
    <section className="relative flex min-h-[190px] items-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#EAF6EE] to-[#D3EADB] px-6 py-6 md:px-10">
      {/* Misty mountains */}
      <svg
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-full w-full"
      >
        <circle cx="600" cy="60" r="90" fill="#fff" opacity="0.5" />
        <path d="M0 140 L120 70 L230 130 L340 60 L470 135 L590 80 L700 130 L800 90 V200 H0Z" fill="#C4E1CD" />
        <path d="M0 165 L100 115 L210 160 L330 105 L450 162 L580 115 L690 160 L800 125 V200 H0Z" fill="#A9D3B7" opacity="0.9" />
      </svg>

      {/* Left: greeting */}
      <div className="relative z-10 max-w-md">
        <h1 className="text-2xl font-bold tracking-tight text-[#12264A] md:text-3xl">
          {greeting}, {user.name}! <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1.5 text-sm text-[#12264A]/70 md:text-base">
          Let&apos;s make today a healthier and stronger you.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-sm text-[#12264A]/80">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/70">
            <CalendarDays className="h-4 w-4" />
          </span>
          {date}
        </div>
      </div>

      {/* Center: tagline */}
      <div className="relative z-10 mx-auto hidden font-[family-name:var(--font-hand)] text-3xl leading-tight text-[#1E5B3A] lg:block">
        <p>Better</p>
        <p className="ml-8">Health</p>
        <p className="ml-3">Happier You</p>
      </div>

      {/* Right: runner, leaves, CTA */}
      <div className="absolute bottom-0 right-4 top-3 z-10 hidden items-end gap-6 md:flex">
        <div className="relative h-full">
          <svg viewBox="0 0 60 80" className="absolute -bottom-1 -left-6 h-24 w-auto" aria-hidden>
            <Leaf x={22} y={80} r={-25} s={0.8} fill="#3E9A5F" />
            <Leaf x={30} y={80} r={15} s={0.9} fill="#2F7D4F" />
            <Leaf x={38} y={80} r={40} s={0.7} fill="#5DB37D" />
          </svg>
          <Runner />
        </div>
        <Link
          href="/workouts"
          className="mb-6 inline-flex items-center gap-2 rounded-lg bg-[#1E5B3A] px-5 py-2.5 text-sm font-medium text-white
            transition-colors hover:bg-[#174a2f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E5B3A]"
        >
          Start Today <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}