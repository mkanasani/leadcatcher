import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { verifyPassword } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const { password } = (await req.json()) as { password?: string };
  const stored = await getSetting(SETTING_KEYS.PASSWORD_HASH);
  if (!stored) {
    return NextResponse.json(
      { ok: false, error: "App not onboarded yet — visit /onboarding" },
      { status: 400 },
    );
  }
  if (!password || !verifyPassword(password, stored)) {
    return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }
  const session = await getSession();
  session.authed = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
