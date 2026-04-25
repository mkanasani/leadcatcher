"use client";
import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";

type Out = { subject: string; body: string };

export function AiDrafter({ onApply }: { onApply: (out: Out) => void }) {
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("warm, direct, confident");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [draft, setDraft] = useState<Out | null>(null);

  async function generate() {
    setErr(null);
    setLoading(true);
    setDraft(null);
    const res = await fetch("/api/ai/generate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offer, audience, goal, tone }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setErr(typeof data.error === "string" ? data.error : "Generation failed");
      return;
    }
    setDraft(data.email);
  }

  return (
    <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-violet-200">
        <Sparkles className="h-4 w-4" />
        AI email drafter (Gemini 2.5 Flash · free)
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          placeholder="Offer (e.g. AI workflow audit, $0)"
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          className="rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
        />
        <input
          placeholder="Audience (e.g. Shopify store owners doing $1M+)"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
        />
        <input
          placeholder="Goal of this email (e.g. confirm the call)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
        />
        <input
          placeholder="Tone"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
        />
      </div>
      <button
        onClick={generate}
        disabled={loading || !offer || !audience || !goal}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-3.5 py-2 text-sm font-medium text-ink-950 disabled:opacity-50"
      >
        <Wand2 className="h-4 w-4" />
        {loading ? "Drafting..." : "Generate"}
      </button>
      {err && <p className="mt-3 text-sm text-pink-400">{err}</p>}
      {draft && (
        <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-ink-950/70 p-3">
          <div className="text-xs uppercase tracking-wider text-white/45">Subject</div>
          <div className="text-sm text-white">{draft.subject}</div>
          <div className="text-xs uppercase tracking-wider text-white/45">Body</div>
          <div
            className="prose prose-sm prose-invert max-w-none text-sm text-white/80"
            dangerouslySetInnerHTML={{ __html: draft.body }}
          />
          <button
            onClick={() => onApply(draft)}
            className="mt-2 rounded-lg border border-lime-400/40 bg-lime-400/10 px-3 py-1.5 text-xs text-lime-300 hover:bg-lime-400/20"
          >
            Use this draft
          </button>
        </div>
      )}
    </div>
  );
}
