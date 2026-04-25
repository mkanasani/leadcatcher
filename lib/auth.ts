import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { getSetting, setSetting, SETTING_KEYS } from "./settings";
import { randomSecret } from "./crypto";

export type Session = { authed?: boolean };

// iron-session requires a >=32-char secret. We pull it from the DB (set during onboarding)
// and lazily auto-generate one if missing — that covers the moment between first onboarding
// submission and the first session being created.
async function getSessionSecret(): Promise<string> {
  let secret = await getSetting(SETTING_KEYS.SESSION_SECRET);
  if (!secret || secret.length < 32) {
    secret = randomSecret(32);
    try {
      await setSetting(SETTING_KEYS.SESSION_SECRET, secret);
    } catch {
      // Settings table may not exist yet — fall back to ephemeral secret for this request.
    }
  }
  return secret;
}

async function options(): Promise<SessionOptions> {
  return {
    password: await getSessionSecret(),
    cookieName: "leadcatcher_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  const store = await cookies();
  return getIronSession<Session>(store, await options());
}

export async function requireAuth() {
  const session = await getSession();
  return Boolean(session.authed);
}
