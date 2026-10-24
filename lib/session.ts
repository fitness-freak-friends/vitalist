import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// Use in API routes and server actions: the id always comes from the session
export async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}