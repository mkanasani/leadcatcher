import { db, schema } from "@/db/client";
import { count, eq, gte, sql } from "drizzle-orm";
import { StatCard } from "@/components/stat-card";
import { GlowCard } from "@/components/glow-card";
import { Activity, CalendarClock, Mail, Users } from "lucide-react";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function loadStats() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  try {
    const [leadsTotal, leads7d, sendsScheduled, sendsSent] = await Promise.all([
      db.select({ n: count() }).from(schema.leads),
      db.select({ n: count() }).from(schema.leads).where(gte(schema.leads.createdAt, since)),
      db
        .select({ n: count() })
        .from(schema.scheduledSends)
        .where(eq(schema.scheduledSends.status, "scheduled")),
      db
        .select({ n: count() })
        .from(schema.scheduledSends)
        .where(eq(schema.scheduledSends.status, "sent")),
    ]);
    const recent = await db
      .select()
      .from(schema.leads)
      .orderBy(sql`${schema.leads.createdAt} desc`)
      .limit(8);
    return {
      leadsTotal: leadsTotal[0]?.n ?? 0,
      leads7d: leads7d[0]?.n ?? 0,
      sendsScheduled: sendsScheduled[0]?.n ?? 0,
      sendsSent: sendsSent[0]?.n ?? 0,
      recent,
      ok: true as const,
    };
  } catch (err) {
    return {
      leadsTotal: 0,
      leads7d: 0,
      sendsScheduled: 0,
      sendsSent: 0,
      recent: [],
      ok: false as const,
      error: err instanceof Error ? err.message : "DB unreachable",
    };
  }
}

export default async function DashboardOverview() {
  const stats = await loadStats();
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Mission Control</h1>
        <p className="mt-1 text-sm text-white/55">
          Live snapshot of leads captured and emails queued.
        </p>
      </header>

      {!stats.ok && (
        <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-sm text-pink-200">
          DB not connected yet — paste a <code>NETLIFY_DATABASE_URL</code> in your env, then run{" "}
          <code>npm run db:push</code>. ({stats.error})
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total leads"
          value={stats.leadsTotal}
          glow="violet"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="New this week"
          value={stats.leads7d}
          glow="cyan"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          label="Emails queued"
          value={stats.sendsScheduled}
          glow="magenta"
          icon={<CalendarClock className="h-5 w-5" />}
        />
        <StatCard
          label="Emails sent"
          value={stats.sendsSent}
          glow="lime"
          icon={<Mail className="h-5 w-5" />}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-[0.18em] text-white/55">Recent leads</h2>
        <GlowCard glow="cyan">
          {stats.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/50">
              No leads yet — connect a Cal.com webhook or drop your lead-magnet URL into a form.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-white/45">
                <tr>
                  <th className="py-2 text-left font-normal">Email</th>
                  <th className="py-2 text-left font-normal">Source</th>
                  <th className="py-2 text-left font-normal">Appointment</th>
                  <th className="py-2 text-left font-normal">Captured</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((l) => (
                  <tr key={l.id} className="border-t border-white/5">
                    <td className="py-2.5">
                      <div className="font-medium text-white">{l.email}</div>
                      {l.name && <div className="text-xs text-white/45">{l.name}</div>}
                    </td>
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
      </section>
    </div>
  );
}
