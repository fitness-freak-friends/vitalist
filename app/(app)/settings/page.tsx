import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSettings, listUserSessions } from "@/lib/setting-service";
import ProfileForm from "@/components/settings/ProfileForm";
import GoalsForm from "@/components/settings/GoalForm";
import SecuritySection from "@/components/settings/SecuritySection";

export const metadata = { title: "Settings · Vitalist" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const userId = session.user.id;

  const [data, sessions] = await Promise.all([
    getSettings(userId),
    listUserSessions(userId, session.session.id),
  ]);
  if (!data) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#14211C] md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-[#14211C]/60">
          Manage your profile, daily goals and account security.
        </p>
      </div>

      <ProfileForm initial={data.profile} />
      <GoalsForm initial={data.goals} />
      <SecuritySection sessions={sessions} />
    </div>
  );
}