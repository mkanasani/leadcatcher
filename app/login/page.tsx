import { redirect } from "next/navigation";
import { isOnboarded } from "@/lib/settings";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!(await isOnboarded())) redirect("/onboarding");
  return <LoginForm />;
}
