/**
 * calendar-cron — a tiny Cloudflare Worker that drives the site's inbound Google Calendar sync.
 *
 * On a schedule (see wrangler.jsonc `triggers.crons`) it POSTs the site's sync route with a bearer
 * token. The site's /api/cron/calendar-sync route does the actual incremental pull from Google
 * Calendar and upserts/deletes Supabase rows. This worker is deployed SEPARATELY from the main site.
 */

export interface Env {
  /** Deployed site origin, e.g. https://www.ministrydomain.org (set in wrangler.jsonc `vars`). */
  SITE_URL: string;
  /** Must match the site's CRON_SYNC_SECRET. Set with: wrangler secret put CRON_SYNC_SECRET */
  CRON_SYNC_SECRET: string;
}

const SYNC_PATH = "/api/cron/calendar-sync";

async function runSync(env: Env): Promise<Response> {
  return fetch(`${env.SITE_URL}${SYNC_PATH}`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.CRON_SYNC_SECRET}` },
  });
}

export default {
  /** Invoked by the Cloudflare Cron Trigger. */
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runSync(env));
  },

  /** Optional manual trigger for testing. Requires the same bearer token. */
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.headers.get("authorization") !== `Bearer ${env.CRON_SYNC_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
    const res = await runSync(env);
    return new Response(`calendar-sync -> ${res.status}`, { status: res.status });
  },
};
