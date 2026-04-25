import { db, schema } from "@/db/client";
import { eq, and } from "drizzle-orm";
import { scheduleEmail, cancelScheduledEmail } from "./resend";

export type Anchor = { type: "calcom"; appointmentAt: Date } | { type: "lead_magnet"; signupAt: Date };

export function computeSendTime(anchor: Anchor, offsetMinutes: number): Date {
  const base = anchor.type === "calcom" ? anchor.appointmentAt : anchor.signupAt;
  return new Date(base.getTime() + offsetMinutes * 60_000);
}

export type RenderContext = {
  name?: string | null;
  email: string;
  appointmentAt?: Date | null;
};

function render(template: string, ctx: RenderContext): string {
  return template
    .replaceAll("{{name}}", ctx.name ?? "there")
    .replaceAll("{{email}}", ctx.email)
    .replaceAll(
      "{{appointment_at}}",
      ctx.appointmentAt
        ? ctx.appointmentAt.toLocaleString("en-US", {
            dateStyle: "full",
            timeStyle: "short",
          })
        : "",
    );
}

/**
 * Given a fresh lead and a sequence, schedules every step via Resend's `scheduled_at`
 * and records each one in scheduled_sends. Skips steps whose send time is in the past.
 */
export async function scheduleSequenceForLead(args: {
  leadId: string;
  sequenceId: string;
  anchor: Anchor;
  ctx: RenderContext;
}) {
  const steps = await db
    .select()
    .from(schema.sequenceSteps)
    .where(eq(schema.sequenceSteps.sequenceId, args.sequenceId))
    .orderBy(schema.sequenceSteps.position);

  const now = Date.now();
  const results: { stepId: string; status: string; messageId?: string; error?: string }[] = [];

  for (const step of steps) {
    const sendAt = computeSendTime(args.anchor, step.offsetMinutes);
    if (sendAt.getTime() <= now + 30_000) {
      // Too close to now or in the past — skip rather than spam-fire on import.
      await db.insert(schema.scheduledSends).values({
        leadId: args.leadId,
        sequenceId: args.sequenceId,
        stepId: step.id,
        scheduledFor: sendAt,
        status: "cancelled",
        error: "send time already passed",
      });
      results.push({ stepId: step.id, status: "skipped" });
      continue;
    }

    try {
      const subject = render(step.subject, args.ctx);
      const body = render(step.body, args.ctx);
      const messageId = await scheduleEmail({
        to: args.ctx.email,
        subject,
        html: body,
        scheduledAt: sendAt,
      });
      await db.insert(schema.scheduledSends).values({
        leadId: args.leadId,
        sequenceId: args.sequenceId,
        stepId: step.id,
        resendMessageId: messageId,
        scheduledFor: sendAt,
        status: "scheduled",
      });
      results.push({ stepId: step.id, status: "scheduled", messageId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await db.insert(schema.scheduledSends).values({
        leadId: args.leadId,
        sequenceId: args.sequenceId,
        stepId: step.id,
        scheduledFor: sendAt,
        status: "failed",
        error: msg,
      });
      results.push({ stepId: step.id, status: "failed", error: msg });
    }
  }
  return results;
}

export async function cancelLeadSends(leadId: string) {
  const sends = await db
    .select()
    .from(schema.scheduledSends)
    .where(
      and(eq(schema.scheduledSends.leadId, leadId), eq(schema.scheduledSends.status, "scheduled")),
    );
  for (const s of sends) {
    if (s.resendMessageId) {
      try {
        await cancelScheduledEmail(s.resendMessageId);
      } catch {
        // Best effort — Resend may have already sent it.
      }
    }
    await db
      .update(schema.scheduledSends)
      .set({ status: "cancelled" })
      .where(eq(schema.scheduledSends.id, s.id));
  }
}
