import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db/client";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const [seq] = await db.select().from(schema.sequences).where(eq(schema.sequences.id, id));
  if (!seq) return NextResponse.json({ error: "not found" }, { status: 404 });
  const steps = await db
    .select()
    .from(schema.sequenceSteps)
    .where(eq(schema.sequenceSteps.sequenceId, id))
    .orderBy(schema.sequenceSteps.position);
  return NextResponse.json({ sequence: seq, steps });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.delete(schema.sequences).where(eq(schema.sequences.id, id));
  return NextResponse.json({ ok: true });
}
