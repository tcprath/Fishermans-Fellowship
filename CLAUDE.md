# CLAUDE.md — Ministry Website

Durable steering for Claude Code. The detailed specs are authoritative and live in
**`BUILD-SPEC.md`** (public site) and **`ADMIN-SPEC.md`** (admin portal). Read both before
building. This file is the always-loaded summary + the rules that always apply.

---

## Companion source docs — READ THESE for content & design

- **`CONTENT.md`** is the single source of truth for **all copywriting**: mission, page headlines,
  the About narrative, CTAs, the two blog/brand descriptions, devotional voice, and tone.
  **Never invent final copy.** Pull text from `CONTENT.md`. Where something is missing, insert a
  clearly labeled placeholder like `{{HEADLINE}}` and keep a running list of unresolved placeholders
  for the client. Match the tone defined in `CONTENT.md` everywhere.

- **`DESIGN.md`** is the single source of truth for **visual consistency**: color palette,
  typography, logo/marks, imagery direction, spacing and layout feel. Map these to CSS variables and
  the Tailwind theme, and reuse them across every page so the site stays visually consistent.
  **Never hardcode brand hex and never guess brand colors or fonts** — use CSS variables with a
  `/* PLACEHOLDER */` comment until `DESIGN.md` supplies the real values. Each blog may carry a
  subtle accent keyed off its slug; keep both within the `DESIGN.md` system.

If either doc is absent when you start, build with neutral, clearly-labeled placeholders and flag
every spot that needs `CONTENT.md`/`DESIGN.md` input.

---

## What we're building

A nonprofit ministry website with a self-service admin portal:
- **Two blogs** — Fisherman's Fellowship (`/fishermans-fellowship`, its feed also includes
  devotionals) and Rise Up God's Way (`/rise-up-gods-way`).
- **Daily devotionals** — each with a required image; homepage "Devotional of the Day" cycles daily
  with share-to-social; a `/devotionals` catalog.
- **Events** at `/events` — a normal calendar **managed in `/admin`** (stored in Supabase). Each
  event has an **Add to calendar** button so visitors can add it to their own **Google or Apple**
  calendar (Google template link + downloadable `.ics`). No Google account or sync.
- **Contact form**, **email signup**, and **RSS**.
- An **/admin portal** to publish posts/devotionals and manage events.

---

## Stack (do not substitute)

Next.js (App Router, TypeScript) · Tailwind + `@tailwindcss/typography` · shadcn/ui · lucide-react ·
Supabase (Postgres + Auth + Storage, `@supabase/ssr`) · Tiptap (admin authoring) · `sanitize-html` ·
FullCalendar (public events UI) · per-event Add-to-Calendar (Google link + hand-rolled `.ics`) ·
`feed` (RSS) · `date-fns`/`date-fns-tz`. Hosting: **Cloudflare Workers via `@opennextjs/cloudflare`**.

---

## Hosting rules — Cloudflare Workers / OpenNext (hard constraints)

- Deploy target is **Cloudflare Workers** using `@opennextjs/cloudflare`. **Not Vercel. Not Cloudflare Pages.**
- **NEVER** add `export const runtime = "edge"`. The edge runtime is unsupported by this adapter; use
  the default (Node) runtime everywhere.
- `wrangler.jsonc` must keep `compatibility_flags: ["nodejs_compat","global_fetch_strictly_public"]`,
  `compatibility_date` ≥ `2024-09-23`, the `ASSETS` binding, `WORKER_SELF_REFERENCE`, and the R2
  binding `NEXT_INC_CACHE_R2_BUCKET`. `open-next.config.ts` enables the R2 incremental cache.
- **Validate in the real Workers runtime with `npm run preview`** — `next dev` runs on Node and hides
  Workers-only incompatibilities. Build a thin vertical slice and `preview` it before going wide.
- Prefer **Web APIs** (`fetch`, Web Crypto) over Node-only libraries. The calendar integration uses
  `jose` + the Calendar REST API for exactly this reason.
- Public values go in `wrangler` `vars` (prod) / `.env.local` (`next dev`) as `NEXT_PUBLIC_*`.
  **Secrets** go via `wrangler secret put` (prod) and `.dev.vars` (local). **Never** place a secret in
  a `NEXT_PUBLIC_*` var or in `wrangler` `vars`.

---

## Architecture

- Content lives in **Supabase**, rendered by **Server Components** with **short-TTL revalidation**
  (~60s on feeds/posts/devotionals, 300s on events) so edits appear within ~1 minute. On-demand
  `revalidatePath` is an optional upgrade (see `ADMIN-SPEC.md §8`).
- **Two blogs** via one dynamic `[blog]` route validated against the `blogs` table (404 if unknown);
  the Fisherman's Fellowship feed merges published devotionals.
- **Devotional of the Day** is a deterministic, timezone-aware daily rotation over the stable-sorted
  published devotionals (`NEXT_PUBLIC_SITE_TZ`).
- **Events:** stored in Supabase, fully managed in the admin portal (no external accounts/sync). The
  public `/events` page renders them with FullCalendar; each event offers **Add to calendar** — a
  Google template link and a downloadable `.ics` (`events/[id]/ics/route.ts`) that Apple Calendar opens.
- **Admin** at `/admin`: Supabase Auth, **public sign-ups disabled** (authenticated = admin),
  middleware-gated, mutations in Server Actions.

---

## Conventions

- TypeScript throughout; Server Components by default; `"use client"` only where needed.
- Brand tokens are **CSS variables** sourced from `DESIGN.md`; no hardcoded brand hex.
- Accessibility: labeled inputs, visible focus, semantic landmarks; **every devotional image needs
  alt text**. SEO: per-page `metadata` + Open Graph; per-devotional OG image = its image.
- Editor stores **HTML**; **sanitize at save time** (`sanitize-html` allowlist) and render the stored
  clean HTML.
- The Supabase **service-role** client is server-only — never import it into a client component, and
  never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Validate all input (`zod`); keep the honeypot + rate limit on public contact/subscribe.

---

## Commands

```bash
npm run dev          # local (Node) dev
npm run preview      # build + run in the REAL Workers runtime locally (use before trusting Workers behavior)
npm run deploy       # opennextjs-cloudflare build + wrangler deploy
npm run cf-typegen   # generate Cloudflare env types
npx wrangler r2 bucket create ministry-inc-cache   # once
wrangler secret put <NAME>                          # set a production secret
```

---

## Build order

1. Public site (`BUILD-SPEC.md`) → deploy & verify on Cloudflare.
2. Admin portal (`ADMIN-SPEC.md`).
Commit per phase. Run `npm run build`/`npm run preview` at the end of each to catch Workers issues early.

---

## Human-only steps — do NOT attempt; ask the human

Account logins; Supabase project keys, disabling sign-ups, creating admin users; the Storage bucket
and its policies; Cloudflare login; and setting any secret. These are listed in `GETTING-STARTED.md`.
When the build needs one of these, pause and request it rather than guessing or entering credentials.
