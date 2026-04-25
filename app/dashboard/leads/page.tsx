import { db, schema } from "@/db/client";
import { desc } from "drizzle-orm";
import { GlowCard } from "@/components/glow-card";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  let leads: (typeof schema.leads.$inferSelect)[] = [];
  let dbErr: string | null = null;
  try {
    leads = await db
      .select()
      .from(schema.leads)
      .orderBy(desc(schema.leads.createdAt))
      .limit(500);
  } catch (e) {
    dbErr = e instanceof Error ? e.message : "DB unreachable";
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-white/55">
            Everyone who landed via Cal.com or a lead magnet. Newest first.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">
          {leads.length} captured
        </span>
      </header>

      {dbErr && (
        <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-sm text-pink-200">
          {dbErr}
        </div>
      )}

      <GlowCard glow="cyan">
        {leads.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/50">
            No leads yet — drop a webhook into your funnel.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-white/45">
              <tr>
                <th className="py-2 text-left font-normal">Email</th>
                <th className="py-2 text-left font-normal">Name</th>
                <th className="py-2 text-left font-normal">Source</th>
                <th className="py-2 text-left font-normal">Appointment</th>
                <th className="py-2 text-left font-normal">Captured</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="py-2.5 font-medium text-white">{l.email}</td>
                  <td className="py-2.5 text-white/70">{l.name ?? "—"}</td>
                  <td className="py-2.5 text-white/70">{l.source}</td>
                  <td className="py-2.5 text-white/70">
                    {l.appointmentAt ? formatRelative(l.appointmentAt) : "—"}
                  </td>
                  <td className="py-2.5 text-white/55">{formatRelative(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlowCard>
    </div>
  );
}
