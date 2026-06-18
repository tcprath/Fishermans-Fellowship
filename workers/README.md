# calendar-cron worker

A tiny standalone Cloudflare Worker that triggers the site's **two-way Google Calendar inbound
sync** on a schedule. It POSTs `${SITE_URL}/api/cron/calendar-sync` with a bearer token (every 15
minutes by default — see `wrangler.jsonc`). The route on the main site performs the actual
incremental pull from Google Calendar and updates Supabase.

> Deployed **separately** from the main site worker.

## Setup

```bash
cd workers/calendar-cron
npm install
# 1) Set SITE_URL in wrangler.jsonc `vars` to your deployed site origin.
# 2) Set the shared secret (must equal the site's CRON_SYNC_SECRET):
npm run secret            # wrangler secret put CRON_SYNC_SECRET
# 3) Deploy:
npm run deploy
```

## Test locally

```bash
cp .dev.vars.example .dev.vars      # fill CRON_SYNC_SECRET
npm run dev                          # wrangler dev --test-scheduled
# Trigger the scheduled handler:
curl "http://localhost:8787/__scheduled"
# …or the manual fetch endpoint (same bearer):
curl -X POST http://localhost:8787 -H "authorization: Bearer <CRON_SYNC_SECRET>"
```

Use `npm run tail` to watch live logs after deploy.

## Alternative

Instead of this worker you can use any external scheduler (cron-job.org, a GitHub Actions
`schedule`, etc.) to POST the same route with the bearer header. Use one approach or the other —
not both.
