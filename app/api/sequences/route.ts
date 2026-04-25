import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db/client";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const stepSchema = z.object({
  position: z.number().int().min(0),
  offsetMinutes: z.number().int(),
  subject: z.string().min(1).max(300),
  body: z.string().min(1),
});

const createSchema = z.object({
  name: z.string().min(1).max(120),
  triggerType: z.enum(["calcom", "lead_magnet"]),
  triggerSlug: z.string().min(1).max(80).optional().nullable(),
  active: z.boolean().default(true),
  steps: z.array(stepSchema).min(1).max(20),
});

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const seqs = await db.select().from(schema.sequences).orderBy(schema.sequences.createdAt);
  return NextResponse.json({ sequences: seqs });
}

export async function POST(req: NextRequest) {
  if (!(await requireAuth())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const json = await req.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const [seq] = await db
    .insert(schema.sequences)
    .values({
      name: data.name,
      triggerType: data.triggerType,
      triggerSlug: data.triggerType === "lead_magnet" ? (data.triggerSlug ?? null) : null,
      active: data.active,
    })
    .returning();
  await db.insert(schema.sequenceSteps).values(
    data.steps.map((s) => ({
      sequenceId: seq.id,
      position: s.position,
      offsetMinutes: s.offsetMinutes,
      subject: s.subject,
      body: s.body,
    })),
  );
  return NextResponse.json({ sequence: seq });
}
