import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db/client";
import { eq, and } from "drizzle-orm";
import { scheduleSequenceForLead } from "@/lib/scheduler";

export const runtime = "nodejs";

type LeadMagnetPayload = {
  email?: string;
  name?: string;
  [key: string]: unknown;
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let body: LeadMagnetPayload = {};
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = (await req.json()) as LeadMagnetPayload;
  } else {
    const form = await req.formData();
    body = Object.fromEntries(form.entries()) as LeadMagnetPayload;
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { ok: false, error: "valid email required" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const name = typeof body.name === "string" ? body.name : null;
  const signupAt = new Date();

  const [lead] = await db
    .insert(schema.leads)
    .values({
      email,
      name,
      source: `lead_magnet:${slug}`,
      metadata: body as Record<string, unknown>,
    })
    .returning();

  const [sequence] = await db
    .select()
    .from(schema.sequences)
    .where(
      and(
        eq(schema.sequences.triggerType, "lead_magnet"),
        eq(schema.sequences.triggerSlug, slug),
        eq(schema.sequences.active, true),
      ),
    )
    .limit(1);

  let scheduled = 0;
  if (sequence) {
    const results = await scheduleSequenceForLead({
      leadId: lead.id,
      sequenceId: sequence.id,
      anchor: { type: "lead_magnet", signupAt },
      ctx: { name, email },
    });
    scheduled = results.length;
  }

  return NextResponse.json(
    { ok: true, leadId: lead.id, scheduled },
    { headers: corsHeaders() },
  );
}
