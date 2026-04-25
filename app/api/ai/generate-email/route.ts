import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateEmail } from "@/lib/gemini";
import { z } from "zod";

const schema = z.object({
  offer: z.string().min(2).max(500),
  audience: z.string().min(2).max(300),
  goal: z.string().min(2).max(300),
  tone: z.string().max(80).optional(),
  context: z.string().max(800).optional(),
});

export async function POST(req: NextRequest) {
  if (!(await requireAuth())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    const email = await generateEmail(parsed.data);
    return NextResponse.json({ email });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
