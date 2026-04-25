import { NextResponse } from "next/server";
import { db, schema } from "@/db/client";
import { requireAuth } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(schema.leads)
    .orderBy(desc(schema.leads.createdAt))
    .limit(500);
  return NextResponse.json({ leads: rows });
}
