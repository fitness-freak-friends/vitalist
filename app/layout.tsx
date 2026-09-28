import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const font = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-sans" });
const hand = Caveat({ subsets: ["latin"], weight: "700", variable: "--font-hand" });

export const metadata: Metadata = {
  title: "Vitalist",
  description: "Your all-in-one fitness and health companion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${font.variable} ${hand.variable} font-[family-name:var(--font-sans)] antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}