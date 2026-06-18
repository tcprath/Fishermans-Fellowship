FISHERMAN'S FELLOWSHIP — WEBSITE ASSET BUNDLE (v2)
==================================================
Original identity (c) 2023, designed by Ryan Johnsen.

logos/svg/          Recolorable production SVGs — USE THESE for the web build
  ff-wordmark.svg     primary wordmark (gold fish-hook initial)
  ff-monogram.svg     FF oval monogram (twin sparkles)
icons/              Recolorable secondary icons
  icon-north-star.svg
  icon-fish-hook.svg
logos/raw-source/   Designer's untouched uploaded SVGs (archival)
fonts/              Ephemera Sickles Block — display face
  EphemeraSickles-Block.otf     desktop original
  EphemeraSickles-Block.woff2   ~14 KB, web-embeddable (used in the stylesheet)
photos/             Hero + section photography (blue-hour)
mockups/            Merch proofs (tee, hat, sticker)

RECOLORING
----------
Every SVG in logos/svg and icons is two-variable:
  color: #243746;        -> the "ink"  (blue / cream / black / white)
  --ff-accent: #BD9A5F;  -> the gold   (sparkle / hook)
Set those two on the SVG or a parent to get any of the five official
colorways from one file. Files ship showing Blue + Gold by default.

  Blue + Gold (light bg):   color:#243746; --ff-accent:#BD9A5F
  Cream + Gold (dark bg):   color:#F4EDE5; --ff-accent:#BD9A5F
  Blue + Cream (medium bg): color:#243746; --ff-accent:#F4EDE5
  One-color black:          color:#000;    --ff-accent:#000
  One-color white:          color:#fff;    --ff-accent:#fff

FONT
----
Ephemera Sickles Block is a commercial face (Ephemera Fonts / MyFonts).
The .woff2 is embedded in the working stylesheet so the real letterforms
are visible for review. For the live production site, pair it with the
appropriate webfont license from the foundry.

PALETTE
-------
FF Cream  #F4EDE5  rgb(244,237,229)  Pantone 4685 C (30%)
FF Blue   #243746  rgb(36,55,70)     Pantone 7546 C
FF Gold   #BD9A5F  rgb(189,154,95)   Pantone 7562 C
