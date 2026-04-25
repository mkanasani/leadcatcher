"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlowCard } from "./glow-card";
import { AiDrafter } from "./ai-drafter";
import { Plus, Trash2, Sparkles } from "lucide-react";

type TriggerType = "calcom" | "lead_magnet";

type Step = {
  position: number;
  // Stored in minutes. UI lets the user pick value + unit + direction.
  offsetValue: number;
  offsetUnit: "minutes" | "hours" | "days";
  direction: "before" | "after";
  subject: string;
  body: string;
};

function toMinutes(s: Step, trigger: TriggerType): number {
  const unitMin = s.offsetUnit === "minutes" ? 1 : s.offsetUnit === "hours" ? 60 : 1440;
  const v = s.offsetValue * unitMin;
  if (trigger === "lead_magnet") return Math.abs(v); // always after signup
  return s.direction === "before" ? -v : v;
}

const DEFAULT_STEP: Step = {
  position: 0,
  offsetValue: 24,
  offsetUnit: "hours",
  direction: "before",
  subject: "Quick reminder about our call, {{name}}",
  body: "<p>Hi {{name}},</p><p>Just confirming we&apos;re on for {{appointment_at}}.</p><p>Reply with anything you want to cover and I&apos;ll prep it ahead of time.</p>",
};

export function SequenceBuilder() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<TriggerType>("calcom");
  const [slug, setSlug] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ ...DEFAULT_STEP }]);
  const [drafterFor, setDrafterFor] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function update(i: number, patch: Partial<Step>) {
    setSteps((cur) => cur.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function addStep() {
    setSteps((cur) => [
      ...cur,
      {
        ...DEFAULT_STEP,
        position: cur.length,
        offsetValue: 1,
        offsetUnit: "hours",
        direction: trigger === "calcom" ? "before" : "after",
      },
    ]);
  }

  function removeStep(i: number) {
    setSteps((cur) => cur.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, position: idx })));
  }

  async function save() {
    setErr(null);
    if (!name) return setErr("Sequence name required");
    if (trigger === "lead_magnet" && !slug) return setErr("Slug required for lead magnet");
    setSaving(true);
    const res = await fetch("/api/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        triggerType: trigger,
        triggerSlug: trigger === "lead_magnet" ? slug : null,
        active: true,
        steps: steps.map((s, i) => ({
          position: i,
          offsetMinutes: toMinutes(s, trigger),
          subject: s.subject,
          body: s.body,
        })),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(typeof data.error === "string" ? data.error : "Save failed");
      return;
    }
    router.push("/dashboard/sequences");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <GlowCard glow="violet">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-white/55">Sequence name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Discovery call nurture"
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-white outline-none focus:border-violet-400 focus:shadow-[0_0_20px_-4px_rgba(168,85,247,0.5)]"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-white/55">Trigger</span>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as TriggerType)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-white outline-none focus:border-violet-400"
            >
              <option value="calcom">Cal.com booking</option>
              <option value="lead_magnet">Lead magnet form</option>
            </select>
          </label>
          {trigger === "lead_magnet" && (
            <label className="block md:col-span-2">
              <span className="text-xs uppercase tracking-wider text-white/55">URL slug</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="growth-guide"
                className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 font-mono text-cyan-200 outline-none focus:border-violet-400"
              />
              <span className="mt-1 block text-xs text-white/45">
                Becomes <code>/api/webhooks/lead-magnet/{slug || "your-slug"}</code>
              </span>
            </label>
          )}
        </div>
      </GlowCard>

      <div className="space-y-4">
        {steps.map((s, i) => (
          <GlowCard key={i} glow={i % 2 === 0 ? "cyan" : "magenta"}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-white/65">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-semibold text-ink-950">
                  {i + 1}
                </span>
                Step {i + 1}
              </div>
              <button
                onClick={() => removeStep(i)}
                className="text-white/40 hover:text-pink-400"
                disabled={steps.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-white/55">When</span>
                <input
                  type="number"
                  min={0}
                  value={s.offsetValue}
                  onChange={(e) => update(i, { offsetValue: Number(e.target.value) })}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-white outline-none focus:border-violet-400"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-white/55">Unit</span>
                <select
                  value={s.offsetUnit}
                  onChange={(e) =>
                    update(i, { offsetUnit: e.target.value as Step["offsetUnit"] })
                  }
                  className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-white outline-none focus:border-violet-400"
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
              </label>
              {trigger === "calcom" ? (
                <label className="block">
                  <span className="text-xs uppercase tracking-wider text-white/55">Direction</span>
                  <select
                    value={s.direction}
                    onChange={(e) =>
                      update(i, { direction: e.target.value as Step["direction"] })
                    }
                    className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-white outline-none focus:border-violet-400"
                  >
                    <option value="before">before call</option>
                    <option value="after">after call</option>
                  </select>
                </label>
              ) : (
                <div className="flex items-end pb-2 text-sm text-white/55">after signup</div>
              )}
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-white/55">Subject</span>
              <input
                value={s.subject}
                onChange={(e) => update(i, { subject: e.target.value })}
                className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-white outline-none focus:border-violet-400"
              />
            </label>
            <label className="mt-3 block">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/55">Body (HTML)</span>
                <button
                  onClick={() => setDrafterFor(drafterFor === i ? null : i)}
                  className="inline-flex items-center gap-1 rounded-lg border border-violet-400/40 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-200 transition-all hover:bg-violet-500/20 hover:shadow-[0_0_18px_-6px_rgba(168,85,247,0.7)]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Draft with AI
                </button>
              </div>
              <textarea
                value={s.body}
                onChange={(e) => update(i, { body: e.target.value })}
                rows={6}
                className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 font-mono text-sm text-white outline-none focus:border-violet-400"
              />
            </label>

            {drafterFor === i && (
              <div className="mt-4">
                <AiDrafter
                  onApply={(out) => {
                    update(i, { subject: out.subject, body: out.body });
                    setDrafterFor(null);
                  }}
                />
              </div>
            )}
          </GlowCard>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={addStep}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          <Plus className="h-4 w-4" /> Add step
        </button>
        <div className="flex items-center gap-3">
          {err && <span className="text-sm text-pink-400">{err}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2 text-sm font-medium text-ink-950 shadow-[0_0_24px_-6px_rgba(168,85,247,0.7)] transition-all hover:shadow-[0_0_36px_-4px_rgba(168,85,247,0.9)] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save sequence"}
          </button>
        </div>
      </div>
    </div>
  );
}
