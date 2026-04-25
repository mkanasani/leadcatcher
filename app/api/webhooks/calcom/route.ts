import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db/client";
import { eq, and } from "drizzle-orm";
import { scheduleSequenceForLead, cancelLeadSends } from "@/lib/scheduler";

export const runtime = "nodejs";

type CalcomPayload = {
  triggerEvent?: string;
  payload?: {
    type?: string;
    title?: string;
    startTime?: string;
    endTime?: string;
    attendees?: { email?: string; name?: string }[];
    metadata?: Record<string, unknown>;
  };
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CalcomPayload;
  const trigger = body.triggerEvent ?? "BOOKING_CREATED";
  const p = body.payload;
  const attendee = p?.attendees?.[0];

  if (!attendee?.email || !p?.startTime) {
    return NextResponse.json({ ok: false, error: "missing email or startTime" }, { status: 400 });
  }

  const appointmentAt = new Date(p.startTime);

  if (trigger === "BOOKING_CANCELLED" || trigger === "BOOKING_RESCHEDULED") {
    const existing = await db
      .select()
      .from(schema.leads)
      .where(and(eq(schema.leads.email, attendee.email), eq(schema.leads.source, "calcom")))
      .limit(1);
    if (existing[0]) await cancelLeadSends(existing[0].id);
    if (trigger === "BOOKING_CANCELLED") {
      return NextResponse.json({ ok: true, action: "cancelled" });
    }
  }

  const [lead] = await db
    .insert(schema.leads)
    .values({
      email: attendee.email,
      name: attendee.name ?? null,
      source: "calcom",
      appointmentAt,
      metadata: { eventType: p.type, title: p.title, ...p.metadata },
    })
    .returning();

  const [sequence] = await db
    .select()
    .from(schema.sequences)
    .where(and(eq(schema.sequences.triggerType, "calcom"), eq(schema.sequences.active, true)))
    .limit(1);

  if (!sequence) {
    return NextResponse.json({ ok: true, leadId: lead.id, scheduled: 0, note: "no active calcom sequence" });
  }

  const results = await scheduleSequenceForLead({
    leadId: lead.id,
    sequenceId: sequence.id,
    anchor: { type: "calcom", appointmentAt },
    ctx: { name: attendee.name, email: attendee.email, appointmentAt },
  });

  return NextResponse.json({ ok: true, leadId: lead.id, scheduled: results.length });
}
