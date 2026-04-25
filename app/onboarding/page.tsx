import { redirect } from "next/navigation";
import { isOnboarded, getConfigStatus } from "@/lib/settings";
import { requireAuth } from "@/lib/auth";
import { OnboardingForm } from "@/components/onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const onboarded = await isOnboarded();

  // Editing flow requires auth; first-run is open.
  if (onboarded) {
    const ok = await requireAuth();
    if (!ok) redirect("/login");
  }

  const status = onboarded ? await getConfigStatus() : null;

  return (
    <main className="bg-grid relative min-h-screen overflow-hidden px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
            {onboarded ? "Edit configuration" : "Welcome — let's get you set up"}
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight shimmer-text">
            {onboarded ? "Update your keys" : "Five fields. Two minutes."}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/60">
            {onboarded
              ? "Rotate any key here. Leave the password blank to keep the current one."
              : "Paste your API keys and pick a dashboard password. Everything is stored encrypted in your own database."}
          </p>
        </div>

        <div className="mt-10">
          <OnboardingForm onboarded={onboarded} status={status} />
        </div>
      </div>
    </main>
  );
}
