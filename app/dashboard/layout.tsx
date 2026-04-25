import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { isOnboarded } from "@/lib/settings";
import { Nav } from "@/components/nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isOnboarded())) redirect("/onboarding");
  if (!(await requireAuth())) redirect("/login");
  return (
    <div className="bg-grid relative flex min-h-screen overflow-hidden">
      <Nav />
      <main className="relative flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}
