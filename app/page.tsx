import Link from "next/link";
import { ArrowRight, Mail, Sparkles, Zap } from "lucide-react";
import { GlowCard } from "@/components/glow-card";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="bg-grid absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="flex justify-center">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70 backdrop-blur">
            Mini-CRM · Email Automation · For AI Agencies
          </span>
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-center text-6xl font-bold tracking-tight">
          <span className="shimmer-text">LeadCatcher</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-white/65">
          Catch every lead from your landing pages and Cal.com. Send timed nurture sequences via
          Resend. Generate copy with Gemini. One Netlify deploy. Yours forever.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/onboarding"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-medium text-ink-950 shadow-[0_0_30px_-6px_rgba(168,85,247,0.7)] transition-all hover:shadow-[0_0_40px_-4px_rgba(168,85,247,0.9)]"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3">
          <GlowCard glow="violet">
            <Mail className="h-6 w-6 text-violet-300" />
            <div className="mt-4 text-lg font-semibold">Webhooks → Sequences</div>
            <p className="mt-2 text-sm text-white/60">
              Drop a URL into Cal.com or any landing-page form. Leads land in your CRM, sequences
              fire automatically.
            </p>
          </GlowCard>
          <GlowCard glow="cyan">
            <Zap className="h-6 w-6 text-cyan-300" />
            <div className="mt-4 text-lg font-semibold">Resend `scheduled_at`</div>
            <p className="mt-2 text-sm text-white/60">
              No cron. No queue. We schedule the whole sequence at once and Resend fires on time.
            </p>
          </GlowCard>
          <GlowCard glow="magenta">
            <Sparkles className="h-6 w-6 text-pink-300" />
            <div className="mt-4 text-lg font-semibold">AI Drafting</div>
            <p className="mt-2 text-sm text-white/60">
              Paste your offer, audience, and goal. Gemini drafts the email. Free key, no credit
              card.
            </p>
          </GlowCard>
        </div>
      </div>
    </main>
  );
}
