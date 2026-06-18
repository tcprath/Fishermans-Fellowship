# Fisherman's Fellowship — Design System

**Source of truth for the website build.** Version 1.0 · Locked for development.

Design system by **Andrew Mindy**. Brand identity foundation © 2023, original wordmark and monogram by Ryan Johnsen. Display face: Ephemera Sickles Block (Ephemera Fonts). Body face: Hanken Grotesk.

Stack target: **Next.js (App Router) · TypeScript · Tailwind CSS**. All tokens below are provided as CSS custom properties and a Tailwind theme extension so they drop straight into the build.

---

## Table of contents

1. [Brand foundation](#1-brand-foundation)
2. [Logo system](#2-logo-system)
3. [Color](#3-color)
4. [Typography](#4-typography)
5. [Design tokens](#5-design-tokens)
6. [Spacing, layout & grid](#6-spacing-layout--grid)
7. [Components](#7-components)
8. [Motifs & texture](#8-motifs--texture)
9. [Photography](#9-photography)
10. [Motion](#10-motion)
11. [Accessibility](#11-accessibility)
12. [Implementation notes](#12-implementation-notes)
13. [Asset inventory](#13-asset-inventory)

---

## 1. Brand foundation

Fisherman's Fellowship is an outdoors, heritage, Christ-centered fishing fellowship. The visual register is **weathered, quiet, and reverent** — turn-of-the-century engraving meets blue-hour water. The system leans on a single ornamented display face, a tight three-color palette, generous whitespace, and a recurring four-point/north-star motif.

**Principles**

- **Heritage, not costume.** The Victorian display face does the period work; everything around it stays clean and modern so the page reads as crafted, not kitsch.
- **Quiet luxury.** Deep harbor blue, paper cream, aged-brass gold. Macro whitespace. Hairline rules. The gold is an accent, never a fill.
- **One signature, protected.** The sparkle / north star is the brand's tell. Use it sparingly and it reads as a maker's mark; overuse it and it reads as decoration.
- **Legible first.** Hanken Grotesk carries all real reading. The display face is for headlines and the wordmark only.

---

## 2. Logo system

Two lockups carry the brand.

| Lockup | Use | File |
| --- | --- | --- |
| **Primary wordmark** — "FISHERMAN'S FELLOWSHIP" with the gold fish-hook initial and north-star "O" | General use, large applications, headers, hero | `logos/svg/ff-wordmark.svg` |
| **Secondary monogram** — "FF" oval with twin sparkles | Small/constrained spaces: favicon, avatar, app icon, embroidery, stamps | `logos/svg/ff-monogram.svg` |

### 2.1 Recolorable single-source SVGs

Both marks (and the secondary icons) are **two-variable SVGs**. A single file produces every official colorway:

```css
/* the "ink" — blue / cream / black / white */
color: #243746;
/* the gold sparkle / hook */
--ff-accent: #BD9A5F;
```

Set those two values on the SVG or any ancestor. The artwork inherits `currentColor` for ink and `var(--ff-accent)` for the accent. Files ship showing **Blue + Gold** by default.

### 2.2 Five sanctioned colorways

| Colorway | `color` (ink) | `--ff-accent` | Background |
| --- | --- | --- | --- |
| Blue + Gold | `#243746` | `#BD9A5F` | Light (cream/paper) |
| Cream + Gold | `#F4EDE5` | `#BD9A5F` | Dark (blue) |
| Blue + Cream | `#243746` | `#F4EDE5` | Medium (gold) |
| One-color black | `#000000` | `#000000` | White |
| One-color white | `#FFFFFF` | `#FFFFFF` | Black |

### 2.3 Rules

- **Clear space:** keep open space around the mark equal to the height of the lowercase counter / the monogram's sparkle. Nothing — type, edges, other logos — intrudes.
- **Minimum size:** wordmark no smaller than **140px / 1.25in** wide. Below that, switch to the monogram, which holds down to a **16px** favicon.
- **Do:** pair the colorway to the background brightness. Let the gold sparkle stay gold wherever the surface allows.
- **Don't:** recolor outside the five combinations, stretch, add effects, or place the wordmark over a busy photo without a tint layer beneath it.

---

## 3. Color

### 3.1 Brand core (from the client brand guidelines — do not alter)

| Token | HEX | RGB | CMYK | Pantone |
| --- | --- | --- | --- | --- |
| **FF Cream** | `#F4EDE5` | 244 · 237 · 229 | 3 · 5 · 8 · 0 | 4685 C (30%) |
| **FF Blue** | `#243746` | 36 · 55 · 70 | 86 · 69 · 50 · 46 | 7546 C |
| **FF Gold** | `#BD9A5F` | 189 · 154 · 95 | 26 · 37 · 72 · 2 | 7562 C |

### 3.2 Web extensions (tints, shades, functional text)

The brand stays three colors. Interfaces need hover states, hairlines, and quiet text, so these are derived for screen only.

| Token | HEX | Role |
| --- | --- | --- |
| `--paper` | `#FBF8F2` | Page background (warm off-white above cream) |
| `--cream-200` | `#ECE2D4` | Subtle surface / hairline on cream |
| `--cream-300` | `#E0D3C0` | Deeper cream surface |
| `--blue-900` | `#1B2A36` | Hover / pressed blue, deepest ground |
| `--blue-700` | `#33485A` | Blue tint |
| `--blue-500` | `#5A6E7E` | Muted blue (captions on light) |
| `--blue-300` | `#9FAEBA` | Faint blue |
| `--gold-700` | `#A8854B` | Gold hover / pressed, eyebrows |
| `--gold-300` | `#D8C39C` | Gold tint, dark-surface accents |
| `--ink` | `#243746` | Headings (= FF Blue) |
| `--ink-soft` | `#3E4E5A` | Body copy |
| `--muted` | `#6E7882` | Secondary / meta text |
| `--line` | `rgba(36,55,70,.14)` | Standard hairline / border |
| `--line-soft` | `rgba(36,55,70,.08)` | Faint divider |

### 3.3 Surface pairings (premium = blue ground)

The default "premium" surface is **deep blue ground, cream type, gold for the one thing that matters** (a single CTA or stat). Use it for hero cards, feature blocks, and the footer.

---

## 4. Typography

### 4.1 Faces

| Role | Family | Weights / styles | Notes |
| --- | --- | --- | --- |
| **Display** | Ephemera Sickles Block | 400 (titling) | All-caps ornamented engrosser's serif. Headlines + wordmark only. Commercial license required (see §12). Fallback: `"Fraunces", Georgia, serif`. |
| **Body / UI** | **Hanken Grotesk** | 400, 500, 600, 700 | All real reading: body, labels, UI, forms, navigation. Fallback: `system-ui, sans-serif`. |
| **Serif accent** | Newsreader (italic) | 400 italic | Captions, figure notes, the occasional editorial dek. Fallback: `Georgia, serif`. |

> **Ephemera Sickles Block is an all-caps titling face.** Mixed-case input renders in caps — that's expected, and matches the wordmark. Author headings in sentence case in markup; let the face do the casing.

### 4.2 Type scale (display = Ephemera)

| Level | Size | Weight | Tracking | Line-height |
| --- | --- | --- | --- | --- |
| Display | `clamp(40px, 7vw, 96px)` | 600 | -0.01em | 1.05 |
| H1 / section title | `clamp(34px, 5vw, 52px)` | 600 | -0.01em | 1.05 |
| H2 | `clamp(28px, 4vw, 38px)` | 600 | -0.01em | 1.1 |
| H3 | `clamp(22px, 3vw, 26px)` | 600 | 0 | 1.15 |
| Hero headline | `clamp(30px, 4.5vw, 54px)` | 600 | -0.01em | 1.05 |

### 4.3 Body & UI (Hanken Grotesk)

| Role | Size | Weight | Tracking | Line-height |
| --- | --- | --- | --- | --- |
| Body (base) | 17px (16px ≤560px) | 400 | 0 | 1.7 |
| Body emphasis | 17px | 500 | 0 | 1.7 |
| Lead / intro | 18px | 400 | 0 | 1.6 |
| Label / nav | 12–13px | 600 | 0.04em | 1.2 |
| Eyebrow / utility | 11px | 600/700 | **0.16–0.32em** uppercase | 1.2 |
| Caption (Newsreader italic) | 14–15px | 400 italic | 0 | 1.5 |

**Weight roles:** 400 body · 500 emphasis · 600 labels/headings · 700 UI/buttons.

---

## 5. Design tokens

### 5.1 `globals.css` — paste-ready

```css
:root {
  /* Core brand */
  --ff-cream: #F4EDE5;
  --ff-blue:  #243746;
  --ff-gold:  #BD9A5F;

  /* Web extensions */
  --paper:      #FBF8F2;
  --cream-200:  #ECE2D4;
  --cream-300:  #E0D3C0;
  --blue-900:   #1B2A36;
  --blue-700:   #33485A;
  --blue-500:   #5A6E7E;
  --blue-300:   #9FAEBA;
  --gold-700:   #A8854B;
  --gold-300:   #D8C39C;
  --ink:        #243746;
  --ink-soft:   #3E4E5A;
  --muted:      #6E7882;
  --line:       rgba(36,55,70,.14);
  --line-soft:  rgba(36,55,70,.08);

  /* Logo recolor (set per-instance for colorways) */
  --ff-accent:  #BD9A5F;

  /* Type */
  --font-display: "Ephemera Sickles Block", "Fraunces", Georgia, serif;
  --font-body:    "Hanken Grotesk", system-ui, sans-serif;
  --font-serif:   "Newsreader", Georgia, serif;

  /* Radii */
  --radius-pill:  999px;
  --radius-card:  20px;
  --radius-input: 11px;
  --radius-frame: 2px;

  /* Motion & layout */
  --ease: cubic-bezier(.32,.72,0,1);
  --maxw: 1140px;
}

body {
  background: var(--paper);
  color: var(--ink-soft);
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  color: var(--ink);
  font-weight: 600;
  line-height: 1.05;
}
```

### 5.2 `@font-face` (self-hosted WOFF2)

```css
@font-face {
  font-family: "Ephemera Sickles Block";
  src: url("/fonts/EphemeraSickles-Block.woff2") format("woff2");
  font-weight: 400; font-style: normal; font-display: swap;
}
/* Hanken Grotesk + Newsreader: self-host the same way, or load via next/font/google */
```

> Prefer `next/font` for Hanken Grotesk and Newsreader (automatic subsetting + zero layout shift). Self-host **Ephemera** from `/public/fonts` — it isn't on Google Fonts.

### 5.3 `tailwind.config.ts` — theme extension

```ts
import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        cream:  { DEFAULT: "#F4EDE5", 200: "#ECE2D4", 300: "#E0D3C0" },
        blue:   { DEFAULT: "#243746", 300: "#9FAEBA", 500: "#5A6E7E", 700: "#33485A", 900: "#1B2A36" },
        gold:   { DEFAULT: "#BD9A5F", 300: "#D8C39C", 700: "#A8854B" },
        paper:  "#FBF8F2",
        ink:    { DEFAULT: "#243746", soft: "#3E4E5A" },
        muted:  "#6E7882",
      },
      fontFamily: {
        display: ['"Ephemera Sickles Block"', '"Fraunces"', "Georgia", "serif"],
        body:    ['"Hanken Grotesk"', "system-ui", "sans-serif"],
        serif:   ['"Newsreader"', "Georgia", "serif"],
      },
      borderRadius: { pill: "999px", card: "20px", input: "11px", frame: "2px" },
      maxWidth: { content: "1140px" },
      transitionTimingFunction: { brand: "cubic-bezier(.32,.72,0,1)" },
      letterSpacing: { eyebrow: "0.24em" },
    },
  },
} satisfies Config;
```

---

## 6. Spacing, layout & grid

- **Content max-width:** `1140px`, centered, `32px` side padding (`20px` ≤560px).
- **Section rhythm:** `104px` vertical padding desktop → `72px` ≤880px. Add `scroll-margin-top: 80px` to anchored sections so the sticky nav never covers a heading on jump-links.
- **Spacing scale (8px base):** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 56 · 64 · 104.
- **Section header block:** eyebrow (italic Newsreader gold `01 — Inventory` style or uppercase utility) → H2 → lead paragraph, max-width ~680px, ~56px bottom margin.
- **Grid breakpoints:**
  - `≤880px`: multi-column card grids collapse to 1 column; tile grids (colorways, motifs, photos) go to 2-up.
  - `≤560px`: all tile grids go to 1-up; body 16px.

---

## 7. Components

### 7.1 Buttons

Pill buttons with an optional trailing **arrow-in-circle** affordance. Base: `font-family: var(--font-body); font-weight: 600; font-size: 15px; border-radius: 999px; padding: 13px 14px 13px 24px; gap: 12px;` transitions on `transform/background/color` at `.3s var(--ease)`; `:active { transform: scale(.975) }`. The circle icon is `30px`, `border-radius: 999px`, and nudges `translate(2px,-1px)` on hover.

| Variant | Surface | Text | Icon chip | Hover |
| --- | --- | --- | --- | --- |
| **Primary** | `--ff-blue` | `--ff-cream` | `rgba(244,237,229,.14)` bg, gold glyph | bg → `--blue-900` |
| **Gold** | `--ff-gold` | `--ff-blue` | `rgba(36,55,70,.16)` bg | bg → `--gold-700`, text → cream |
| **Ghost** | transparent, `1.5px var(--line)` border, padding `11px 22px` | `--ink` | — | border → `--ff-blue`, bg `rgba(36,55,70,.04)` |

Use **one** gold button per view — it marks the single most important action.

### 7.2 Form fields

`input { font-size: 15px; padding: 13px 16px; border-radius: 11px; border: 1px solid var(--line); background: var(--paper); }`
`:focus { outline: 0; border-color: var(--ff-gold); background: #fff; }` — **the gold rule is the focus signal.** Labels: uppercase utility (11px/600, `.16em`). Helper text: `--muted`.

### 7.3 Cards & surfaces

- **Standard card:** `background: #fff; border: 1px solid var(--line); border-radius: 20px;` padding 24–32px.
- **Double-bezel panel:** `border: 1px solid var(--line); border-radius: 20px; padding: 1.5px; background: rgba(36,55,70,.03);` wrapping an inner white card — a subtle framed effect for featured content.
- **Dark surface card (premium):** `background: var(--ff-blue); color: var(--ff-cream);` set `--ff-accent: var(--ff-gold)` so any inline mark/CTA reads gold. One gold element max.
- **Status pill / tag:** small pill, `999px`, cream/`cream-200` ground, ink text, `.04em` tracking.

### 7.4 Navigation (sticky index)

Centered pill nav, `position: sticky; top: 0;` translucent paper background with `-webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);` (the `-webkit-` prefix is **required** for iOS). Links are pills; active/hover lifts to white. Wraps to two rows on narrow screens — acceptable.

### 7.5 Article / long-form

Eyebrow → display H2 → italic Newsreader dek → Hanken body. **Pullquote:** display face, ~24px, with a gold left rule (`3px solid var(--ff-gold)`, ~20px padding-left). Subheads in uppercase utility.

---

## 8. Motifs & texture

A small set of recurring devices. Used sparingly they read as craft; overused, as decoration.

| Device | Asset | Use |
| --- | --- | --- |
| **Four-point sparkle** | inline SVG | The signature. Bullets, dividers, eyebrow tick. **Always gold.** |
| **North star** | `icons/icon-north-star.svg` | Section marker or a single hero accent. The fuller, guiding-star cousin of the sparkle. |
| **Fish-hook** | `icons/icon-fish-hook.svg` | Loaders, list bullets, embroidery. The literal anchor of the brand; lives inside the wordmark's initial. |
| **Cornered frame** | CSS | Hairline border with notched gold corner ticks — a "certificate" device for heroes and printed pieces. |
| **Film grain** | CSS/SVG | A whisper of analog noise over blue surfaces and photos. |

**Film grain recipe** (fixed overlay, non-interactive):

```css
body::after {
  content: ""; position: fixed; inset: 0; z-index: 60; pointer-events: none;
  opacity: .035; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

---

## 9. Photography

- **Tone:** moody, desaturated, **blue hour**. Anglers in silhouette, still water, docks, low light. Quiet and reverent — never bright-stock-photo cheerful.
- **Tint layer:** when type sits over a photo, lay a blue gradient beneath it:
  `linear-gradient(180deg, rgba(27,42,54,.72), rgba(27,42,54,.86))` over `center / cover`.
- **Treatment:** cream or gold duotone is acceptable for section dividers (see `photos/section-dock.jpg`). Keep faces and hooks readable; protect contrast for any overlaid wordmark.

---

## 10. Motion

- **Easing:** `cubic-bezier(.32,.72,0,1)` for everything. Slow-out, settled.
- **Scroll reveal:** sections fade up `translateY(22px) → 0` over `.8s`. **Implement as progressive enhancement:** content is visible by default; the hidden/animated state is gated behind a `reveal-on` class added to `<html>` by script, and revealed by a scroll-position check (not a bare IntersectionObserver — it drops elements on iOS WebKit). Include a timeout failsafe so nothing can stay hidden.
- **Micro-interactions:** buttons `scale(.975)` on press; icon chips nudge `translate(2px,-1px)` on hover; cards may lift `translateY(-2px)` with a soft shadow.
- **Respect `prefers-reduced-motion: reduce`** — disable transforms/transitions and force full visibility.

---

## 11. Accessibility

- **Contrast (verified pairings):** ink `#243746` and ink-soft `#3E4E5A` on paper/cream pass AA for body text. Cream on blue passes AA. **Gold `#BD9A5F` on cream does NOT meet AA for body text** — use gold for large display, icons, rules, and accents only, never small body copy. For gold text, use `--gold-700` on cream or reserve gold for ≥24px.
- **Focus:** never remove focus rings. The gold border on inputs is the visible focus signal; ensure interactive elements have an equivalent visible focus state for keyboard users.
- **Targets:** minimum 44×44px touch targets.
- **Motion:** full `prefers-reduced-motion` support (see §10).
- **Semantics:** headings in document order; the all-caps display face is a stylistic render — keep real sentence-case text in the markup for screen readers, don't fake caps with letter-spacing on critical content.

---

## 12. Implementation notes

### Fonts
- **Hanken Grotesk** & **Newsreader** — open-source; load via `next/font/google` (preferred) or self-host WOFF2.
- **Ephemera Sickles Block** — **commercial** (Ephemera Fonts / MyFonts). Self-host the WOFF2 from `/public/fonts`. A **webfont license must be in place for the production domain** — the desktop/OTF license does not cover `@font-face` web embedding. This is the one licensing item to settle before launch.

### Logo delivery
- Inline the recolorable SVGs (don't `<img>` them) so `currentColor` + `--ff-accent` theming works. For repeated inlining, strip internal `id`s to avoid duplicate-ID collisions (the production marks have no internal `url(#…)` refs, so this is safe).
- Generate favicons/app icons from the monogram: 16/32/180px + a maskable PWA icon.

### Performance
- The review stylesheet embeds fonts/images as base64 for portability (~1.3MB single file). **In production, do the opposite:** serve fonts and images as separate cached files, lazy-load below-fold imagery, and let `next/image` handle responsive sizes.

---

## 13. Asset inventory

Delivered in `FF_Assets.zip`:

```
logos/svg/        ff-wordmark.svg, ff-monogram.svg   (recolorable production SVGs)
icons/            icon-north-star.svg, icon-fish-hook.svg
logos/raw-source/ designer originals (incl. reversed monogram) — archival
fonts/            EphemeraSickles-Block.otf (+ .woff2)
photos/           hero-fisherman-blue.jpg, section-dock.jpg   (blue-hour)
mockups/          tshirt.jpg, hat.jpg, sticker.jpg   (proofs, not production art)
```

**Still to produce before launch:** favicon/app-icon set, Open Graph / social templates (1200×630 share card, square avatar, banner), and the Ephemera webfont license. Worth requesting the original layered source files from Ryan Johnsen for archival.

---

*End of design system v1.0 — Fisherman's Fellowship. Maintained by Andrew Mindy.*
