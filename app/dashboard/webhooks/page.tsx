import { headers } from "next/headers";
import { GlowCard } from "@/components/glow-card";
import { CopyField } from "@/components/copy-field";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "your-deploy.netlify.app";
  const base = `${proto}://${host}`;

  let leadMagnets: (typeof schema.sequences.$inferSelect)[] = [];
  try {
    leadMagnets = await db
      .select()
      .from(schema.sequences)
      .where(eq(schema.sequences.triggerType, "lead_magnet"));
  } catch {
    // ignore — DB might not be wired yet
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Webhook URLs</h1>
        <p className="mt-1 text-sm text-white/55">
          Paste these into Cal.com or any landing-page form. They&apos;re yours, on your domain.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-[0.18em] text-white/55">Cal.com</h2>
        <GlowCard glow="cyan">
          <p className="text-sm text-white/65">
            In Cal.com → Settings → Developer → Webhooks → New. Subscribe to{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">BOOKING_CREATED</code>,
            optionally{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">BOOKING_CANCELLED</code> and{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">BOOKING_RESCHEDULED</code>.
          </p>
          <div className="mt-4">
            <CopyField value={`${base}/api/webhooks/calcom`} />
          </div>
        </GlowCard>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-[0.18em] text-white/55">Lead magnets</h2>
        {leadMagnets.length === 0 ? (
          <GlowCard glow="magenta">
            <p className="text-sm text-white/55">
              No lead-magnet sequences yet. Create one (set a slug like <code>guide</code>) and a
              POST URL appears here.
            </p>
          </GlowCard>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {leadMagnets.map((s) => (
              <GlowCard key={s.id} glow="magenta">
                <div className="text-sm font-medium">{s.name}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/45">
                  /{s.triggerSlug}
                </div>
                <div className="mt-3">
                  <CopyField value={`${base}/api/webhooks/lead-magnet/${s.triggerSlug}`} />
                </div>
                <p className="mt-3 text-xs text-white/55">
                  POST JSON or form-data with{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5">email</code> (and optional{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5">name</code>).
                </p>
              </GlowCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
