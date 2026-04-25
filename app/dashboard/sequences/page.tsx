import Link from "next/link";
import { db, schema } from "@/db/client";
import { desc, eq } from "drizzle-orm";
import { GlowCard } from "@/components/glow-card";
import { Plus, Workflow } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SequencesPage() {
  let sequences: (typeof schema.sequences.$inferSelect)[] = [];
  const stepCounts: Record<string, number> = {};
  let dbErr: string | null = null;
  try {
    sequences = await db.select().from(schema.sequences).orderBy(desc(schema.sequences.createdAt));
    for (const s of sequences) {
      const rows = await db
        .select()
        .from(schema.sequenceSteps)
        .where(eq(schema.sequenceSteps.sequenceId, s.id));
      stepCounts[s.id] = rows.length;
    }
  } catch (e) {
    dbErr = e instanceof Error ? e.message : "DB unreachable";
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Sequences</h1>
          <p className="mt-1 text-sm text-white/55">
            Time-offset email sequences triggered by webhook events.
          </p>
        </div>
        <Link
          href="/dashboard/sequences/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium text-ink-950 shadow-[0_0_24px_-6px_rgba(168,85,247,0.7)] transition-all hover:shadow-[0_0_36px_-4px_rgba(168,85,247,0.9)]"
        >
          <Plus className="h-4 w-4" />
          New sequence
        </Link>
      </header>

      {dbErr && (
        <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-sm text-pink-200">
          {dbErr}
        </div>
      )}

      {sequences.length === 0 ? (
        <GlowCard glow="violet">
          <div className="py-10 text-center">
            <Workflow className="mx-auto h-10 w-10 text-violet-300/70" />
            <p className="mt-4 text-white/65">No sequences yet.</p>
            <Link
              href="/dashboard/sequences/new"
              className="mt-4 inline-block rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Build your first one
            </Link>
          </div>
        </GlowCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sequences.map((s) => (
            <GlowCard key={s.id} glow={s.triggerType === "calcom" ? "cyan" : "magenta"}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{s.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-white/50">
                    {s.triggerType === "calcom"
                      ? "Cal.com booking"
                      : `Lead magnet · /${s.triggerSlug}`}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${s.active ? "bg-lime-400/20 text-lime-300" : "bg-white/10 text-white/50"}`}
                >
                  {s.active ? "active" : "paused"}
                </span>
              </div>
              <div className="mt-4 text-sm text-white/60">{stepCounts[s.id] ?? 0} steps</div>
            </GlowCard>
          ))}
        </div>
      )}
    </div>
  );
}
