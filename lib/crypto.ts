import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

// Derive a per-deployment key from NETLIFY_DATABASE_URL. The DB URL is already a
// per-deploy secret; using it as the encryption seed means encrypted values are
// only readable by the running app, not by accidental DB dumps shared elsewhere.
function getEncryptionKey(): Buffer {
  const seed = process.env.NETLIFY_DATABASE_URL ?? "leadcatcher-dev-fallback-key-please-set-database-url";
  return scryptSync(seed, "leadcatcher-v1", 32);
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}

export function decrypt(stored: string): string {
  const [ivB64, tagB64, encB64] = stored.split(".");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const enc = Buffer.from(encB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("base64")}.${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltB64, hashB64] = stored.split(".");
  if (!saltB64 || !hashB64) return false;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  const actual = scryptSync(password, salt, 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function randomSecret(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}
