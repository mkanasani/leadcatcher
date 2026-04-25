import { sql } from "drizzle-orm";
import { db } from "@/db/client";

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "sequences" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "trigger_type" text NOT NULL,
    "trigger_slug" text,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "sequence_steps" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "sequence_id" uuid NOT NULL REFERENCES "sequences"("id") ON DELETE CASCADE,
    "position" integer NOT NULL,
    "offset_minutes" integer NOT NULL,
    "subject" text NOT NULL,
    "body" text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "leads" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" text NOT NULL,
    "name" text,
    "source" text NOT NULL,
    "appointment_at" timestamp with time zone,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "leads_email_idx" ON "leads" ("email")`,
  `CREATE INDEX IF NOT EXISTS "leads_source_idx" ON "leads" ("source")`,
  `CREATE TABLE IF NOT EXISTS "scheduled_sends" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "lead_id" uuid NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
    "sequence_id" uuid NOT NULL REFERENCES "sequences"("id") ON DELETE CASCADE,
    "step_id" uuid NOT NULL REFERENCES "sequence_steps"("id") ON DELETE CASCADE,
    "resend_message_id" text,
    "scheduled_for" timestamp with time zone NOT NULL,
    "status" text DEFAULT 'scheduled' NOT NULL,
    "error" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "scheduled_sends_lead_idx" ON "scheduled_sends" ("lead_id")`,
  `CREATE INDEX IF NOT EXISTS "scheduled_sends_status_idx" ON "scheduled_sends" ("status")`,
  `CREATE TABLE IF NOT EXISTS "app_settings" (
    "key" text PRIMARY KEY NOT NULL,
    "value" text NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
  )`,
];

let bootstrapped = false;

export async function ensureSchema() {
  if (bootstrapped) return;
  for (const stmt of STATEMENTS) {
    await db.execute(sql.raw(stmt));
  }
  bootstrapped = true;
}
