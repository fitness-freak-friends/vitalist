import { redirect } from "next/navigation";
import { Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import OnboardingForm from "./OnboardingForm";

export const metadata = { title: "Set up your profile · Vitalist" };

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });
  if (user?.onboardingCompleted) redirect("/");

  return (
    <div className="min-h-screen bg-[#F3F5F2] px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 flex items-center gap-2">
          <Activity className="h-6 w-6 text-[#0F2A24]" />
          <span className="text-xl font-semibold tracking-tight text-[#0F2A24]">Vitalist</span>
        </div>
        <OnboardingForm name={session.user.name} />
      </div>
    </div>
  );
}