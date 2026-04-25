import { Resend } from "resend";
import { getMany, SETTING_KEYS } from "./settings";

export type ScheduleArgs = {
  to: string;
  subject: string;
  html: string;
  scheduledAt: Date;
};

async function getResendConfig() {
  const cfg = await getMany([SETTING_KEYS.RESEND_API_KEY, SETTING_KEYS.RESEND_FROM_EMAIL]);
  const apiKey = cfg[SETTING_KEYS.RESEND_API_KEY];
  const from = cfg[SETTING_KEYS.RESEND_FROM_EMAIL];
  if (!apiKey) throw new Error("Resend API key not configured. Open /onboarding to set it.");
  if (!from) throw new Error("Resend from-email not configured. Open /onboarding to set it.");
  return { apiKey, from };
}

export async function scheduleEmail(args: ScheduleArgs) {
  const { apiKey, from } = await getResendConfig();
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    scheduledAt: args.scheduledAt.toISOString(),
  });
  if (result.error) throw new Error(result.error.message);
  return result.data!.id;
}

export async function cancelScheduledEmail(messageId: string) {
  const { apiKey } = await getResendConfig();
  const resend = new Resend(apiKey);
  await resend.emails.cancel(messageId);
}
