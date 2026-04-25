import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cached: NeonHttpDatabase<typeof schema> | null = null;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (cached) return cached;
  const url = process.env.NETLIFY_DATABASE_URL;
  if (!url) {
    throw new Error(
      "NETLIFY_DATABASE_URL is not set. On Netlify this is auto-provisioned by Netlify DB. For local dev, paste a Neon connection string into .env.local.",
    );
  }
  const sql = neon(url);
  cached = drizzle(sql, { schema });
  return cached;
}

// Proxy delays the env-check until a method is actually called, not at module import.
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_t, prop) {
    const real = getDb();
    const value = (real as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(real) : value;
  },
});

export { schema };
