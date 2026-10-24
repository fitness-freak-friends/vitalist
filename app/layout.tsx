import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/caveat/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitalist",
  description: "Your all-in-one fitness and health companion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-[family-name:var(--font-sans)] antialiased">{children}</body>
    </html>
  );
}