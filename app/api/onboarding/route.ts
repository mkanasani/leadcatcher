import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureSchema } from "@/lib/bootstrap";
import { setSetting, isOnboarded, SETTING_KEYS } from "@/lib/settings";
import { hashPassword, randomSecret } from "@/lib/crypto";
import { requireAuth } from "@/lib/auth";

const baseSchema = z.object({
  resendApiKey: z.string().trim().min(8, "Resend API key looks too short"),
  resendFromEmail: z.string().trim().email("Must be a valid email"),
  geminiApiKey: z.string().trim().optional().or(z.literal("")),
});

const firstRunSchema = baseSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const editSchema = baseSchema.extend({
  password: z.string().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  await ensureSchema();

  const alreadyOnboarded = await isOnboarded();
  if (alreadyOnboarded && !(await requireAuth())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const schema = alreadyOnboarded ? editSchema : firstRunSchema;
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (!alreadyOnboarded) {
    // First run — set everything fresh.
    await setSetting(SETTING_KEYS.PASSWORD_HASH, hashPassword(data.password!));
    await setSetting(SETTING_KEYS.SESSION_SECRET, randomSecret(32));
  } else if (data.password) {
    // Editing — only rotate password if a new one was provided.
    await setSetting(SETTING_KEYS.PASSWORD_HASH, hashPassword(data.password));
  }

  await setSetting(SETTING_KEYS.RESEND_API_KEY, data.resendApiKey);
  await setSetting(SETTING_KEYS.RESEND_FROM_EMAIL, data.resendFromEmail);
  if (data.geminiApiKey) {
    await setSetting(SETTING_KEYS.GEMINI_API_KEY, data.geminiApiKey);
  }

  return NextResponse.json({ ok: true, firstRun: !alreadyOnboarded });
}
