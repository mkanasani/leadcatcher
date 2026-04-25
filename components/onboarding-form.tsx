"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedBorder } from "./animated-border";
import { Check, ExternalLink, KeyRound, Mail, Sparkles } from "lucide-react";

type Status = {
  resendApiKeySet: boolean;
  resendFromEmail: string | null;
  geminiApiKeySet: boolean;
} | null;

export function OnboardingForm({ onboarded, status }: { onboarded: boolean; status: Status }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [resendApiKey, setResendApiKey] = useState("");
  const [resendFromEmail, setResendFromEmail] = useState(status?.resendFromEmail ?? "");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, resendApiKey, resendFromEmail, geminiApiKey }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const flat = data?.error?.fieldErrors;
      if (flat) {
        const first = Object.values(flat).flat()[0] as string | undefined;
        setErr(first ?? "Save failed");
      } else {
        setErr(typeof data.error === "string" ? data.error : "Save failed");
      }
      return;
    }
    const data = await res.json();
    if (data.firstRun) {
      router.push("/login");
    } else {
      router.push("/dashboard/settings");
      router.refresh();
    }
  }

  return (
    <AnimatedBorder>
      <form onSubmit={submit} className="space-y-6 p-6">
        <Field
          icon={<KeyRound className="h-4 w-4" />}
          label="Dashboard password"
          hint={
            onboarded
              ? "Leave blank to keep your current password."
              : "Used to log in. 8+ characters."
          }
          required={!onboarded}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={onboarded ? "•••••••• (unchanged)" : "Pick something strong"}
            autoFocus={!onboarded}
            className={inputCls}
          />
        </Field>

        <Field
          icon={<Mail className="h-4 w-4" />}
          label="Resend API key"
          link={{ href: "https://resend.com/api-keys", label: "resend.com" }}
          set={status?.resendApiKeySet}
          required={!onboarded}
        >
          <input
            type="password"
            value={resendApiKey}
            onChange={(e) => setResendApiKey(e.target.value)}
            placeholder={status?.resendApiKeySet ? "•••••••• (replace to rotate)" : "re_..."}
            className={inputCls}
          />
        </Field>

        <Field icon={<Mail className="h-4 w-4" />} label="From email" required={!onboarded}>
          <input
            type="email"
            value={resendFromEmail}
            onChange={(e) => setResendFromEmail(e.target.value)}
            placeholder="hello@yourdomain.com"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-white/45">
            Must be on a domain you&apos;ve verified in Resend.
          </p>
        </Field>

        <Field
          icon={<Sparkles className="h-4 w-4" />}
          label="Gemini API key (optional)"
          hint="Powers the AI email drafter. Free, no credit card."
          link={{ href: "https://aistudio.google.com/app/apikey", label: "ai.google.dev" }}
          set={status?.geminiApiKeySet}
        >
          <input
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder={status?.geminiApiKeySet ? "•••••••• (replace to rotate)" : "AIza..."}
            className={inputCls}
          />
        </Field>

        {err && <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 p-3 text-sm text-pink-200">{err}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-medium text-ink-950 shadow-[0_0_30px_-8px_rgba(168,85,247,0.8)] transition-all hover:shadow-[0_0_40px_-6px_rgba(168,85,247,1)] disabled:opacity-50"
        >
          {loading ? "Saving..." : onboarded ? "Update keys" : "Activate LeadCatcher"}
        </button>
      </form>
    </AnimatedBorder>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-white outline-none transition-all focus:border-violet-400 focus:shadow-[0_0_20px_-4px_rgba(168,85,247,0.5)]";

function Field({
  icon,
  label,
  hint,
  link,
  set,
  required,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  link?: { href: string; label: string };
  set?: boolean;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/65">
          <span className="text-violet-300">{icon}</span>
          {label}
          {required && <span className="text-pink-400">*</span>}
        </span>
        <span className="flex items-center gap-2 text-xs">
          {set && (
            <span className="inline-flex items-center gap-1 rounded-full bg-lime-400/20 px-2 py-0.5 text-lime-300">
              <Check className="h-3 w-3" /> set
            </span>
          )}
          {link && (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-cyan-300/80 hover:text-cyan-200"
            >
              {link.label} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </span>
      </div>
      {children}
      {hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}
    </label>
  );
}
