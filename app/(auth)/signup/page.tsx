import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Create account · Vitalist" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}