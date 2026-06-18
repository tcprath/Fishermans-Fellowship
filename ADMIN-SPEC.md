# Admin Portal Spec — Ministry Website

> Build **after** the public site (`BUILD-SPEC.md`). Publishing surface for both blogs, the
> devotionals, and an **admin-managed events calendar**. Reuses the Supabase schema in
> `BUILD-SPEC.md §4`. Hosting is **Cloudflare Workers / OpenNext** (see `BUILD-SPEC.md §9`).

---

## 0. Overview & auth model

- Protected `/admin` area; **Supabase Auth** (email + password); **public sign-ups disabled** so
  the only accounts are admins the ministry creates → "authenticated = admin," and RLS grants
  authenticated users full CRUD. (Hardening option: an `admins` allowlist checked via `auth.uid()`.)
- Admin mutations run in **Server Actions** that verify the session, then write to Supabase. Public
  pages refresh via short-TTL revalidation (§8).
- Claude Code builds the portal; the **human** creates the first admin user and the Storage bucket (§9).

---

## 1. Authentication

- `@supabase/ssr` cookie sessions. **`middleware.ts`** protects `/admin/*` except `/admin/login`;
  no session → redirect to `/admin/login?next=…`.
- `(admin)/admin/login/page.tsx`: email+password (`react-hook-form` + `zod`) →
  `supabase.auth.signInWithPassword` → redirect. Sign-out action in the admin header.
- In Supabase: **disable new sign-ups**; create admin user(s) manually (human, §9).

---

## 2. Admin shell

```
src/app/(admin)/admin/
  layout.tsx   page.tsx(dashboard)   login/page.tsx
  posts/ page.tsx · new/page.tsx · [id]/page.tsx
  devotionals/ page.tsx · new/page.tsx · [id]/page.tsx
  events/ page.tsx · new/page.tsx · [id]/page.tsx
```
Sidebar: Dashboard · Posts · Devotionals · Events. Dashboard shows counts (posts per blog,
devotionals, upcoming events), recent activity, and quick-create buttons. Use shadcn `table`,
`dialog`, `select`, `badge`, `dropdown-menu`, `skeleton`.

---

## 3. Posts management (both blogs)

- **List:** Title · **Blog** · Status · Updated; filter by blog + status; search; row actions
  Edit / Publish-Unpublish / Delete (confirm `dialog`).
- **Editor:** Blog (`select` from `blogs`) · Title · Slug (auto-kebab, editable, unique per blog) ·
  Excerpt · Hero image (upload §6) · Author · Body (Tiptap §5) · Status. Actions Save draft /
  Publish (sets `published_at` on first publish) / Unpublish / Delete via Server Actions →
  sanitize body (§5) → write → revalidate (§8) → toast. "View on site" link when published.

---

## 4. Devotionals management

- **List:** Title · Scripture · Status · Updated; same filters/actions.
- **Editor:** Title · Slug (unique) · Scripture (optional) · **Image (REQUIRED** — block publish
  without it; upload §6) · Excerpt · Body (Tiptap) · Status. Reminder that the image is also the
  social/OG image (~1200×630). On publish, revalidate `/devotionals`, `/devotionals/<slug>`,
  `/fishermans-fellowship`, and `/` (Devotional-of-the-Day pool).

---

## 5. The editor (Tiptap) + sanitization

- `components/admin/rich-editor.tsx` (client): `@tiptap/react` + `starter-kit`, `link`, `image`,
  `placeholder`. Toolbar: H2/H3, bold, italic, lists, blockquote, link, image (insert via §6),
  undo/redo. Strip residual inline styles on paste-from-Word.
- **Storage = HTML.** Sanitize **server-side at save time** via `src/lib/sanitize.ts`
  (`sanitize-html`, allowlist) and store the cleaned HTML. Public render injects the stored HTML.
  Workers fallback noted in `BUILD-SPEC.md §7`.

---

## 6. Image upload (Supabase Storage)

- Public bucket **`media`**; folders `posts/`, `devotionals/`.
- `components/admin/image-upload.tsx` (client): pick + preview → upload via the browser Supabase
  client to `media/<type>/<uuid>-<filename>` → store the public URL on the row.
- Validate type (jpeg/png/webp) + size (≤5 MB) client and server.
- **Storage policies** (human, §9): public `SELECT`; `INSERT/UPDATE/DELETE` only `authenticated`.

---

## 7. Events — admin-managed calendar (no external sync)

A normal calendar stored entirely in **Supabase** and managed in the portal. There is **no Google
account, service account, API, or background sync.** Visitors add events to *their own* calendars
from the public site via the **Add to calendar** control (Google link + `.ics`) specified in
`BUILD-SPEC.md §6`.

### Admin events UI (`/admin/events`)
- **List:** Upcoming / Past tabs; Title · Start · End · Location · Status; row actions Edit / Delete.
- **Editor (`new` / `[id]`):** Title · Description · Location · **Start** · **End** · **All-day**
  toggle · Status (Draft / Published). Interpret entered times in `NEXT_PUBLIC_SITE_TZ`; for all-day,
  store date-bounded times. Validate `end ≥ start`.
- Actions: Save / Publish / Unpublish / Delete via Server Actions → Supabase write →
  `revalidatePath('/events')` → toast.

That's the whole feature — a CRUD table over the `events` table. No jose, no `googleapis`, no cron.

---

## 8. Revalidation on Cloudflare

**Default (simple):** short-TTL revalidation only (R2 incremental cache) — edits appear within the
page's `revalidate` window (~1 min content, 5 min events). No extra config; recommended for this site.

**Optional (instant):** enable OpenNext **on-demand** revalidation so admin actions can call
`revalidatePath`/`revalidateTag` for immediate updates. Requires adding a **tag cache** (a D1-backed
tag cache is fine for low traffic), the **queue** override, and the **cache-purge** component
(`CACHE_PURGE_API_TOKEN` + `CACHE_PURGE_ZONE_ID`) in `open-next.config.ts`. If enabled, have each
post/devotional/event action call the relevant `revalidatePath`s (affected blog route + slug, `/`,
feeds, `/devotionals`, `/events`).

---

## 9. Human setup checklist (one-time)

- [ ] Supabase: run the schema; **disable public sign-ups**; create admin user(s).
- [ ] Supabase Storage: create public bucket **`media`** + policies (§6).
- [ ] (Optional) `admins` allowlist + tightened RLS.
- [ ] Cloudflare: `wrangler login`; create R2 bucket `ministry-inc-cache`; set Wrangler secrets
      (`SUPABASE_SERVICE_ROLE_KEY`, optional email).

---

## 10. Security checklist

- [ ] `/admin/*` gated by middleware; Server Actions re-verify the session before writes.
- [ ] Service-role key is a **Wrangler secret**, server-only, never `NEXT_PUBLIC_`.
- [ ] Public sign-ups disabled; anon RLS reads limited to published.
- [ ] `body_html` sanitized at save; uploads validated; Storage writes limited to authenticated.
- [ ] Public contact/subscribe keep honeypot + rate limiting.

---

## 11. Definition of Done (admin portal)

- [ ] Log in works; `/admin` unreachable signed out; sign-out works.
- [ ] Create/edit/publish/unpublish/delete a **post** per blog; appears on the correct public feed.
- [ ] **Devotional** with image; publish blocked without an image; appears in FF feed, `/devotionals`,
      and DotD pool.
- [ ] Image upload → Supabase Storage → renders via public URL.
- [ ] **Events:** create/edit/delete an event in `/admin/events` → it appears/updates/disappears on
      `/events`; draft events stay hidden; the public Add-to-Calendar buttons reflect the saved details.
- [ ] Editor output renders correctly and is sanitized.
- [ ] §9 setup + §10 security verified.
