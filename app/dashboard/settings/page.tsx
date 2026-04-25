import Link from "next/link";
import { GlowCard } from "@/components/glow-card";
import { getConfigStatus } from "@/lib/settings";
import { Check, Pencil, X } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const status = await getConfigStatus();

  const rows = [
    {
      label: "Dashboard password",
      sub: "Used to sign in",
      ok: status.passwordSet,
      required: true,
    },
    {
      label: "Resend API key",
      sub: "For sending and scheduling emails",
      ok: status.resendApiKeySet,
      required: true,
    },
    {
      label: "From email",
      sub: status.resendFromEmail ?? "—",
      ok: !!status.resendFromEmail,
      required: true,
    },
    {
      label: "Gemini API key",
      sub: "Powers the AI email drafter",
      ok: status.geminiApiKeySet,
      required: false,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-white/55">
            Stored encrypted in your own database. No env vars to edit.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium text-ink-950 shadow-[0_0_24px_-6px_rgba(168,85,247,0.7)] transition-all hover:shadow-[0_0_36px_-4px_rgba(168,85,247,0.9)]"
        >
          <Pencil className="h-4 w-4" />
          Edit keys
        </Link>
      </header>

      <GlowCard glow="violet">
        <div className="divide-y divide-white/5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{r.label}</div>
                <div className="text-xs text-white/45">{r.sub}</div>
              </div>
              {r.ok ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-lime-400/20 px-2 py-0.5 text-xs text-lime-300">
                  <Check className="h-3 w-3" /> set
                </span>
              ) : r.required ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/20 px-2 py-0.5 text-xs text-pink-300">
                  <X className="h-3 w-3" /> missing
                </span>
              ) : (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                  optional
                </span>
              )}
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
