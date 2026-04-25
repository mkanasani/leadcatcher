import { db, schema } from "@/db/client";
import { eq, sql, inArray } from "drizzle-orm";
import { encrypt, decrypt } from "./crypto";

export const SETTING_KEYS = {
  PASSWORD_HASH: "password_hash",
  SESSION_SECRET: "session_secret",
  RESEND_API_KEY: "resend_api_key",
  RESEND_FROM_EMAIL: "resend_from_email",
  GEMINI_API_KEY: "gemini_api_key",
} as const;

const ENCRYPTED_KEYS = new Set<string>([
  SETTING_KEYS.RESEND_API_KEY,
  SETTING_KEYS.GEMINI_API_KEY,
]);

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    // table may not exist yet on a fresh deploy — caller will trigger bootstrap on save
    return fallback;
  }
}

export async function getSetting(key: string): Promise<string | null> {
  return safeQuery(async () => {
    const rows = await db
      .select()
      .from(schema.appSettings)
      .where(eq(schema.appSettings.key, key))
      .limit(1);
    if (!rows[0]) return null;
    return ENCRYPTED_KEYS.has(key) ? decrypt(rows[0].value) : rows[0].value;
  }, null);
}

export async function setSetting(key: string, value: string) {
  const stored = ENCRYPTED_KEYS.has(key) ? encrypt(value) : value;
  await db
    .insert(schema.appSettings)
    .values({ key, value: stored, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.appSettings.key,
      set: { value: stored, updatedAt: new Date() },
    });
}

export async function getMany(keys: string[]): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {};
  for (const k of keys) out[k] = null;
  await safeQuery(async () => {
    const rows = await db
      .select()
      .from(schema.appSettings)
      .where(inArray(schema.appSettings.key, keys));
    for (const r of rows) {
      out[r.key] = ENCRYPTED_KEYS.has(r.key) ? decrypt(r.value) : r.value;
    }
    return null;
  }, null);
  return out;
}

export async function isOnboarded(): Promise<boolean> {
  // Onboarded means a password hash exists. Bootstrap may not have run yet — that's fine.
  return safeQuery(async () => {
    const rows = await db
      .select({ k: schema.appSettings.key })
      .from(schema.appSettings)
      .where(eq(schema.appSettings.key, SETTING_KEYS.PASSWORD_HASH))
      .limit(1);
    return rows.length > 0;
  }, false);
}

// Used by the dashboard Settings page to show what's configured (without revealing values).
export async function getConfigStatus() {
  const all = await getMany(Object.values(SETTING_KEYS));
  return {
    passwordSet: !!all[SETTING_KEYS.PASSWORD_HASH],
    sessionSecretSet: !!all[SETTING_KEYS.SESSION_SECRET],
    resendApiKeySet: !!all[SETTING_KEYS.RESEND_API_KEY],
    resendFromEmail: all[SETTING_KEYS.RESEND_FROM_EMAIL] ?? null,
    geminiApiKeySet: !!all[SETTING_KEYS.GEMINI_API_KEY],
  };
}

// Tiny helper: does the table itself exist? Used to decide whether to redirect
// new users to onboarding even before any rows.
export async function settingsTableExists(): Promise<boolean> {
  return safeQuery(async () => {
    await db.execute(sql`SELECT 1 FROM "app_settings" LIMIT 1`);
    return true;
  }, false);
}
