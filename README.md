# LeadCatcher

A self-hosted mini-CRM + email automation hub for AI agencies. One Netlify deploy. Yours forever.

- **Capture leads** from Cal.com bookings and any landing-page form
- **Schedule nurture sequences** with Resend's `scheduled_at` (no cron, no queue)
- **Draft emails with Gemini** (free key, no credit card)
- **Futuristic dashboard** — glow on hover, animated gradient borders
- **In-app onboarding** — paste your API keys in the UI; no Netlify env vars to edit

## Deploy in one click

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/mkanasani/leadcatcher)

That's it. Netlify auto-provisions a Postgres database (Netlify DB, powered by Neon) and exposes it as `NETLIFY_DATABASE_URL`. Open the deployed URL → onboarding screen → paste your Resend + Gemini keys → done.

### Onboarding (in-app)

When you visit your deploy for the first time, you'll see a setup screen asking for:

| Field | Required | Where to get it |
|---|---|---|
| Dashboard password | yes | You pick it (8+ chars) |
| Resend API key | yes | https://resend.com → API Keys |
| Resend from email | yes | A verified domain in Resend |
| Gemini API key | optional | https://aistudio.google.com/app/apikey (free, no card) |

Everything is stored in your own database — API keys are AES-GCM encrypted at rest, the password is scrypt-hashed.

## Local dev

```bash
cp .env.example .env.local
# only NETLIFY_DATABASE_URL is required — paste a Neon connection string
npm install
npm run dev
```

Open http://localhost:3000 → onboarding screen.

## How it works

```
Cal.com → POST /api/webhooks/calcom ─┐
                                      ├─→ insert lead → look up active sequence
Form    → POST /api/webhooks/         │     → for each step, call Resend with scheduled_at
          lead-magnet/[slug]   ───────┘     → store Resend message IDs in scheduled_sends
```

When a booking is **cancelled** or **rescheduled**, LeadCatcher cancels the queued Resend messages by ID — no zombie emails.

Tables are auto-created on first onboarding submission via `CREATE TABLE IF NOT EXISTS` — you don't need to run any migrations manually.

## Free-tier reality (April 2026)

- **Netlify**: 300 credits/mo (deploy frequency is the real ceiling, traffic is trivial)
- **Netlify DB**: included on Free, beta, ~0.5 GB storage via Neon
- **Resend**: 100 emails/day, `scheduled_at` works on Free
- **Gemini 2.5 Flash**: free of charge, no card
- **Cal.com**: webhooks on Free

Practical ceiling: ~600 leads/mo at 5 emails each = ~3,000 sends, all-free. Above that, Resend Pro ($20/mo) is the only paid wall.

## License

MIT.
