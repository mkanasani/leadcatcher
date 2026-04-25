import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const sequences = pgTable("sequences", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  // "calcom" sequences anchor on appointment time (offset = minutes BEFORE start, negative = AFTER)
  // "lead_magnet" sequences anchor on signup time (offset = minutes AFTER signup)
  triggerType: text("trigger_type").notNull(), // 'calcom' | 'lead_magnet'
  // For lead_magnet: matches the slug in /api/webhooks/lead-magnet/[slug]
  triggerSlug: text("trigger_slug"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sequenceSteps = pgTable("sequence_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  sequenceId: uuid("sequence_id")
    .notNull()
    .references(() => sequences.id, { onDelete: "cascade" }),
  // Order within the sequence
  position: integer("position").notNull(),
  // Minutes offset from anchor.
  // For calcom: NEGATIVE means before appointment (e.g. -1440 = 24h before).
  // For lead_magnet: POSITIVE means after signup (e.g. 60 = 1h after).
  offsetMinutes: integer("offset_minutes").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
});

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name"),
    source: text("source").notNull(), // 'calcom' | 'lead_magnet:<slug>' | 'manual'
    // For calcom: scheduled appointment ISO time
    appointmentAt: timestamp("appointment_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byEmail: index("leads_email_idx").on(t.email),
    bySource: index("leads_source_idx").on(t.source),
  }),
);

// Tracks which Resend message IDs we scheduled so we can cancel/inspect them.
export const scheduledSends = pgTable(
  "scheduled_sends",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    sequenceId: uuid("sequence_id")
      .notNull()
      .references(() => sequences.id, { onDelete: "cascade" }),
    stepId: uuid("step_id")
      .notNull()
      .references(() => sequenceSteps.id, { onDelete: "cascade" }),
    resendMessageId: text("resend_message_id"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("scheduled"), // 'scheduled' | 'sent' | 'cancelled' | 'failed'
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byLead: index("scheduled_sends_lead_idx").on(t.leadId),
    byStatus: index("scheduled_sends_status_idx").on(t.status),
  }),
);

// Key-value store for app config that the user sets in the in-app onboarding flow.
// Sensitive values (API keys) are stored AES-GCM encrypted; the password is stored
// as a scrypt hash; the session secret is stored as random bytes (used to sign cookies).
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Sequence = typeof sequences.$inferSelect;
export type SequenceStep = typeof sequenceSteps.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type ScheduledSend = typeof scheduledSends.$inferSelect;
export type AppSetting = typeof appSettings.$inferSelect;
