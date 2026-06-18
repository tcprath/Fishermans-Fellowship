# Build Spec — Ministry Website (Public Site)

> Hand this to Claude Code as the kickoff prompt for the **public site**. The **admin portal**
> (auth, content management, events CRUD) is in `ADMIN-SPEC.md` — build the public site first.
> After Phase 2, copy Context + Architecture + Conventions into a repo-root `CLAUDE.md`.
>
> **Hosting: Cloudflare Workers via the OpenNext adapter** (`@opennextjs/cloudflare`) — Cloudflare's
> recommended way to run Next.js. Not Vercel, not Cloudflare Pages.
> **Supersedes** the earlier Google Drive / Cowork sync — discard `blog-sync-workflow.md`.

---

## 0. Project Context

A simple, professional nonprofit ministry site with a self-service admin portal.

- **Companion docs override generic choices:** `CONTENT.md` (copy) and `DESIGN.md` (visuals).
  Use labeled placeholders where missing.
- **Content lives in Supabase**, is managed in the admin portal, and renders via server components
  with short-TTL revalidation so published changes appear within ~1 minute (no redeploy).

### Content surfaces
1. **Two blogs**, served from one dynamic route:
   - **Fisherman's Fellowship** (`/fishermans-fellowship`) — its feed also includes **devotionals**.
   - **Rise Up God's Way** (`/rise-up-gods-way`) — standalone article feed.
2. **Daily devotionals** — short pieces, **each with a required image**; appear in the FF feed, power
   the homepage **"Devotional of the Day"** (cycles daily, share-to-social), and fill `/devotionals`.
3. **Events calendar** (`/events`) — a normal calendar **managed in the admin section** (stored in
   Supabase). Each event has an **"Add to calendar"** button so visitors can add it to **their own
   Google or Apple calendar** (a Google template link + a downloadable `.ics`). No Google account,
   service account, or background sync.
4. **Contact form** + **email signup** (RSS also provided).

---

## 1. Tech Stack (fixed)

| Layer | Choice |
|---|---|
| Framework | **Next.js (App Router)**, latest stable, TypeScript |
| Styling | **Tailwind CSS** + `@tailwindcss/typography` |
| UI | **shadcn/ui** + **lucide-react** |
| Data / Auth / Files | **Supabase** — Postgres, Auth, Storage; `@supabase/ssr` for cookie sessions |
| Rich text | **Tiptap** (admin) → HTML, **sanitized at save time** (see §7) |
| Events | Stored in **Supabase**, managed in admin; public **FullCalendar** view reads from Supabase |
| Add to calendar | Per-event **Google template link** + downloadable **`.ics`** (hand-rolled; no external account) |
| RSS | Route handler using the `feed` package |
| Daily rotation | `date-fns` / `date-fns-tz` |
| Forms | `react-hook-form` + `zod` |
| Hosting | **Cloudflare Workers** via **`@opennextjs/cloudflare`**; **R2** incremental cache; **Wrangler** deploy |
| Email (optional) | Contact notification + newsletter — see §8 |

---

## 2. Prerequisites (assumed present)

Dev machine has `node` (v20+), `git`, `gh` (authed), the **Supabase CLI**, and **Wrangler ≥ 3.99**
authed to Cloudflare (`npx wrangler login`). Accounts exist: GitHub, **Cloudflare**, Supabase.
Account logins are human steps.

---

## 3. Phase 1 — Initialize + Cloudflare adapter

```bash
npx create-next-app@latest ministry-site \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
cd ministry-site

npx shadcn@latest init
npx shadcn@latest add button card input textarea label form sonner navigation-menu \
  sheet separator badge aspect-ratio tabs dropdown-menu dialog select table skeleton

# Core
npm i @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers \
  date-fns date-fns-tz feed sanitize-html @tailwindcss/typography
# Authoring (admin)
npm i @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link \
  @tiptap/extension-image @tiptap/extension-placeholder
# Calendar UI
npm i @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/list
# Cloudflare adapter + tooling (dev)
npm i -D @opennextjs/cloudflare wrangler
```

### Cloudflare files (create at repo root)
- **`open-next.config.ts`** — enable the R2 incremental cache:
  ```ts
  import { defineCloudflareConfig } from "@opennextjs/cloudflare";
  import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
  export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
  ```
- **`wrangler.jsonc`**:
  ```jsonc
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "main": ".open-next/worker.js",
    "name": "ministry-site",
    "compatibility_date": "2025-03-01",
    "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
    "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
    "services": [{ "binding": "WORKER_SELF_REFERENCE", "service": "ministry-site" }],
    "r2_buckets": [{ "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "ministry-inc-cache" }]
  }
  ```
- **`public/_headers`** — per OpenNext static-asset caching guidance.
- Add to `.gitignore`: `.open-next`, `.dev.vars`.
- `package.json` scripts:
  ```jsonc
  "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy":  "opennextjs-cloudflare build && wrangler deploy",
  "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
  ```
- **Do not** add `export const runtime = "edge"` anywhere — unsupported by this adapter.

Local dev uses `next dev`; `npm run preview` runs the real Workers runtime locally.
Create the R2 bucket once: `npx wrangler r2 bucket create ministry-inc-cache`.

---

## 4. Phase 2 — Data model (Supabase)

> Shared by the public site and admin portal. Run via the Supabase SQL editor / `supabase` migrations.

```sql
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, description text,
  created_at timestamptz not null default now()
);
insert into public.blogs (slug, name, description) values
  ('fishermans-fellowship', 'Fisherman''s Fellowship', '{{FF_DESCRIPTION}}'),
  ('rise-up-gods-way',      'Rise Up God''s Way',       '{{RUGW_DESCRIPTION}}');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references public.blogs(id) on delete restrict,
  slug text not null, title text not null, excerpt text,
  body_html text, hero_image_url text, author text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (blog_id, slug)
);
create trigger posts_updated before update on public.posts for each row execute function set_updated_at();

create table public.devotionals (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, scripture text, excerpt text,
  body_html text, image_url text not null,           -- required
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger devotionals_updated before update on public.devotionals for each row execute function set_updated_at();

-- EVENTS: a normal calendar managed in the admin portal. No external sync.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, location text,
  starts_at timestamptz not null, ends_at timestamptz not null,
  all_day boolean not null default false,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger events_updated before update on public.events for each row execute function set_updated_at();

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, subject text, message text not null,
  created_at timestamptz not null default now()
);
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique, source text default 'website',
  created_at timestamptz not null default now()
);

-- RLS
alter table public.blogs enable row level security;
alter table public.posts enable row level security;
alter table public.devotionals enable row level security;
alter table public.events enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.subscribers enable row level security;

create policy "blogs read"      on public.blogs       for select using (true);
create policy "posts read pub"  on public.posts       for select using (status = 'published');
create policy "devos read pub"  on public.devotionals for select using (status = 'published');
create policy "events read pub" on public.events      for select using (status = 'published');
create policy "posts admin all"  on public.posts       for all to authenticated using (true) with check (true);
create policy "devos admin all"  on public.devotionals for all to authenticated using (true) with check (true);
create policy "blogs admin all"  on public.blogs       for all to authenticated using (true) with check (true);
create policy "events admin all" on public.events      for all to authenticated using (true) with check (true);
-- contact_submissions, subscribers: no anon policies; written server-side via the service role.
```

**Supabase clients (`src/lib/supabase/`):** `server.ts` (SSR cookie client), `service.ts`
(server-only service-role; never imported client-side), `client.ts` (browser anon for auth + Storage).

---

## 5. Phase 3 — Design system

`DESIGN.md` → palette as CSS variables (`--brand-primary/-accent/-ink/-bg`) wired into Tailwind +
shadcn; fonts via `next/font`; logo/favicon; an optional per-blog accent keyed off `blogs.slug`.
Neutral default + `/* PLACEHOLDER */` until provided.
**Images:** content images are public Supabase Storage URLs — add the Supabase Storage hostname to
`next.config` `images.remotePatterns`. (Cloudflare image optimization via the OpenNext `images`
binding is an optional upgrade; otherwise set those images `unoptimized`.)

---

## 6. Phase 4 — Public structure & pages

```
src/app/(site)/
  layout.tsx                 page.tsx                  about/page.tsx
  [blog]/page.tsx            [blog]/[slug]/page.tsx    [blog]/rss.xml/route.ts
  devotionals/page.tsx       devotionals/[slug]/page.tsx
  events/page.tsx            events/[id]/ics/route.ts  contact/page.tsx   rss.xml/route.ts
src/app/(admin)/ ...         # see ADMIN-SPEC.md
src/app/api/ contact/route.ts  subscribe/route.ts
src/lib/ content.ts  devotional-of-the-day.ts  ics.ts  sanitize.ts  supabase/*
src/components/ site-header  site-footer  post-card  devotional-card
  devotional-of-the-day(server)  share-buttons(client)  events-calendar(client)  add-to-calendar(client)
  contact-form(client)  subscribe-form(client)
```

### Pages
- **Home:** hero · mission · **Devotional of the Day** (share) · recent entries from both blogs ·
  email signup · footer CTA.
- **About**.
- **`/[blog]`:** resolve against `blogs` (404 if unknown); list published posts newest-first.
  **Fisherman's Fellowship merges published devotionals** (cards link to `/devotionals/<slug>`);
  filter tabs All/Posts/Devotionals. Show RSS link + signup.
- **`/[blog]/[slug]`:** render **sanitized** `body_html` in `prose`; per-page `metadata`/OG.
- **`/devotionals`:** image grid catalog. **`/devotionals/[slug]`:** image hero, scripture, body,
  `<ShareButtons>`, **OG image = devotional image**.
- **`/events`:** `<EventsCalendar>` (FullCalendar month + list) reading **published events from
  Supabase**; `export const revalidate = 300`. Clicking an event opens its details (dialog/popover)
  with an **`<AddToCalendar>`** control (below).
- **`/contact`:** form + details.

### Add to calendar (per event)
`components/add-to-calendar.tsx` (client) renders an "Add to calendar ▾" dropdown with:
- **Google Calendar** — an anchor to
  `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=START/END&details=…&location=…`
  (URL-encode every field). Timed events use UTC `YYYYMMDDTHHMMSSZ`; all-day uses `YYYYMMDD/YYYYMMDD`
  (Google treats the all-day end date as exclusive — add one day).
- **Apple / Outlook / other (.ics)** — a link to `events/[id]/ics/route.ts`, which loads the event
  from Supabase and returns `text/calendar` with `Content-Disposition: attachment; filename="event.ics"`.
  Apple Calendar opens `.ics` files directly.

`src/lib/ics.ts` hand-builds a single VEVENT (no dependency): `BEGIN:VCALENDAR … VERSION:2.0 …
BEGIN:VEVENT` with `UID`, `DTSTAMP`, `DTSTART`/`DTEND` (UTC `…Z`, or `;VALUE=DATE:YYYYMMDD` for
all-day), `SUMMARY`, `DESCRIPTION`, `LOCATION`. Escape `,` `;` and newlines per RFC 5545 (`\,` `\;`
`\n`); use CRLF line endings. Format times using `NEXT_PUBLIC_SITE_TZ`.

Nav: Home · About · Fisherman's Fellowship · Rise Up God's Way · Devotionals · Events · Contact
(+ Subscribe). Footer includes a discreet `/admin/login` link.

### Freshness (Cloudflare)
Content pages use short-TTL revalidation (`export const revalidate = 60` on feeds/posts/devotionals,
`300` on events) so edits appear within ~1 min with only the R2 incremental cache configured.
*Optional upgrade* for instant updates: OpenNext on-demand revalidation (tag cache + queue + cache
purge) with `revalidatePath` from admin actions — see `ADMIN-SPEC.md §8`.

---

## 7. Phase 5 — Devotional of the Day, Sharing, Sanitize

**Daily selection** (`src/lib/devotional-of-the-day.ts`): deterministic, timezone-aware
(`NEXT_PUBLIC_SITE_TZ`, default `America/New_York`), over the stable-sorted published devotionals
(by `published_at` asc, then `slug`). Same item for everyone on a given calendar day; cycles the catalog.

```ts
import { utcToZonedTime } from "date-fns-tz";
const TZ = process.env.NEXT_PUBLIC_SITE_TZ ?? "America/New_York";
const EPOCH_UTC = Date.UTC(2026, 0, 1);
export function pickOfTheDay<T>(catalog: T[], now = new Date()): T | null {
  const n = catalog.length; if (!n) return null;
  const z = utcToZonedTime(now, TZ);
  const day = Math.floor((Date.UTC(z.getFullYear(), z.getMonth(), z.getDate()) - EPOCH_UTC) / 86_400_000);
  return catalog[((day % n) + n) % n];
}
```
Homepage `export const revalidate = 3600`. `share-buttons.tsx`: Web Share API when available; else
X/Facebook share-intent links + copy-link toast; `url = ${NEXT_PUBLIC_SITE_URL}/devotionals/<slug>`.

**Sanitize** (`src/lib/sanitize.ts`): clean `body_html` with `sanitize-html` (allowlist tags/attrs;
drop `script`, event handlers, `javascript:` URLs). **Sanitize at save time** in admin actions and
store clean HTML; render the stored HTML directly. (Authors are few + trusted since signups are
disabled — defense-in-depth. If `sanitize-html` ever errors under the Workers build, move
sanitization behind a Cloudflare `HTMLRewriter` utility with a no-op fallback in `next dev`.)

---

## 8. Phase 6 — RSS & forms

- `/[blog]/rss.xml` (that blog; FF includes devotionals) and combined `/rss.xml`, built from the
  `feed` package; content = sanitized `body_html`; `pubDate` from `published_at`.
- `POST /api/contact` — `zod`-validate, insert via service-role client, honeypot + rate limit.
- `POST /api/subscribe` — `zod`-validate email, upsert (ignore dup).
- Forms use `react-hook-form` + `zod` + `sonner`, submit via `fetch`.
- Optional email (Resend notification; Brevo list) behind env flags.

---

## 9. Phase 7 — Deploy to Cloudflare

```bash
gh repo create ministry-site --private --source . --remote origin
git add -A && git commit -m "Ministry site: two blogs, devotionals, events" && git push -u origin main

npx wrangler r2 bucket create ministry-inc-cache     # once
npm run preview                                       # verify in the Workers runtime locally
npm run deploy                                        # opennextjs-cloudflare build + wrangler deploy
```
- Set runtime secrets with `wrangler secret put <NAME>` (see §10); set local equivalents in `.dev.vars`.
- Custom domain: add the route/domain to the Worker in the Cloudflare dashboard (Workers → your worker
  → Domains & Routes) and point DNS in Cloudflare.
- *Optional:* connect the GitHub repo via Workers Builds (or a GitHub Action running `npm run deploy`)
  for push-to-deploy.

---

## 10. Environment / secrets

Local: `.dev.vars` (Wrangler) for server secrets + `.env.local` for `NEXT_PUBLIC_*`.
Production: `NEXT_PUBLIC_*` can live in `wrangler.jsonc` `vars`; **secrets** via `wrangler secret put`.

```bash
# Public (vars)
NEXT_PUBLIC_SITE_URL=...   NEXT_PUBLIC_SITE_NAME=...   NEXT_PUBLIC_SITE_TZ="America/New_York"
NEXT_PUBLIC_SUPABASE_URL=...   NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Secrets (wrangler secret put)
SUPABASE_SERVICE_ROLE_KEY=...            # NEVER expose to the browser
RESEND_API_KEY=...                       # optional
CONTACT_NOTIFY_EMAIL=...                 # optional
```

---

## 11. Definition of Done (public site)

- [ ] `npm run preview` runs in the Workers runtime; `npm run deploy` succeeds; site live on Cloudflare.
- [ ] Both blogs resolve at their slugs; unknown slug → 404; FF feed includes devotionals.
- [ ] Devotional of the Day changes by date, same for all visitors that day; share works; OG image resolves.
- [ ] `/devotionals` catalog renders with images + alt text.
- [ ] `/events` shows published events from Supabase (month + list).
- [ ] Each event's **Add to calendar** works: the Google link opens a prefilled event, and the `.ics`
      opens in Apple Calendar with the correct title, time, and location.
- [ ] Contact → `contact_submissions`; subscribe → `subscribers`; honeypot + validation work.
- [ ] `/rss.xml` + `/[blog]/rss.xml` valid; `body_html` sanitized on render; brand tokens are CSS vars.
- [ ] No `runtime = "edge"` exports; R2 incremental cache configured; secrets set via Wrangler.
- [ ] `CLAUDE.md` written.

---

## 12. Build order

1. Init + Cloudflare adapter (§3).  2. Supabase schema + clients + seed blogs (§4).
3. Design tokens (§5).  4. Public structure, blog feeds, post pages (§6).
5. Devotionals + Devotional of the Day + Share + sanitize (§7).
6. Events page + Add-to-Calendar (Google link + `.ics`) (§6).  7. RSS + forms (§8).
8. Deploy to Cloudflare (§9–10).  9. **Then the admin portal** (`ADMIN-SPEC.md`).  10. DoD (§11).
