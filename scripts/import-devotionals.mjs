/**
 * import-devotionals.mjs
 *
 * Parse a devotionals .docx file and optionally commit parsed entries to Supabase.
 *
 * Usage:
 *   node scripts/import-devotionals.mjs <path/to/file.docx>           # parse only
 *   node scripts/import-devotionals.mjs <path/to/file.docx> --commit  # parse + insert
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .dev.vars.
 * Never prints the service-role key.
 *
 * Expected docx structure per devotional:
 *   [date line]        e.g. "July 1 *", "Aug 4*", "Sept 1*", "Oct. 1*"
 *   [title line]       e.g. "Jesus Will Return"
 *   [scripture quote]  one or more paragraphs of the verse text (may have embedded ref)
 *   [scripture ref]    e.g. "1 Thessalonians 5:16-21" or "II Corinthians 5:17 NKJV"
 *   [body paragraphs]
 */

import mammoth from "mammoth";
import { readFileSync, writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// ── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
// Include common abbreviations used in this docx (Aug/Aug., Sept/Sept., Oct/Oct., etc.)
const MONTH_ABBR = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Sept","Oct","Nov","Dec",
];

// Date lines like: "July 1 *", "Aug 4*", "Sept 1*", "Oct. 3*", "Jan. 15th,"
// The * is a bookmark marker; optional ordinal suffix; optional trailing punctuation.
const DATE_RE = new RegExp(
  `^(${[...MONTH_NAMES,...MONTH_ABBR].join("|")})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s*[*,.]?\\s*$`,
  "i"
);

// Scripture references — supports:
//   digit prefix:  "1 Thessalonians 5:16-21", "2 Corinthians 4:4"
//   roman prefix:  "II Corinthians 5:17 NKJV", "I Peter 4:12"
//   no prefix:     "John 3:16", "Proverbs 3:5-6 NIV", "Psalm 23:1 (KJV)"
const SCRIPTURE_REF_RE = /^(?:[1-3]|I{1,3}V?|IV)\s+[A-Z][a-z]+\.?\s+\d+:\d+(?:[,–\-]\d+)*(?:\s+\(?\w+\)?)?[.!]?\s*$|^[A-Z][a-z]+\.?\s+\d+:\d+(?:[,–\-]\d+)*(?:\s+\(?\w+\)?)?[.!]?\s*$/;

// Lines that signal the end of the main devotional content (extras/appendix)
const STOP_WORDS_RE = /^EXTRAS?$|^APPENDIX$|^NOTES?$/i;

function parseMonth(str) {
  const s = str.replace(/\.$/, "").toLowerCase();
  const mi = MONTH_NAMES.findIndex((m) => m.toLowerCase() === s);
  if (mi >= 0) return mi + 1;
  // Handle Sept → 9, Sep → 9
  const normAbbr = s === "sept" ? "sep" : s;
  const ai = MONTH_ABBR.findIndex((m) => m.toLowerCase() === normAbbr);
  if (ai >= 0) {
    // Return 1-based month: Jan=1, Feb=2, ... Sep/Sept=9, Oct=10, Nov=11, Dec=12
    const baseAbbr = ["jan","feb","mar","apr","may","jun","jul","aug","sep","sept","oct","nov","dec"];
    const monthNums = [1,2,3,4,5,6,7,8,9,9,10,11,12];
    return monthNums[baseAbbr.indexOf(normAbbr === "sept" ? "sept" : normAbbr)] ?? null;
  }
  return null;
}

function toSlug(title, month, day) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const abbr = MONTH_NAMES[month - 1].slice(0, 3).toLowerCase();
  return `${abbr}-${String(day).padStart(2, "0")}-${base}`;
}

function readDevVars() {
  try {
    const raw = readFileSync(".dev.vars", "utf8");
    const vars = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^(\w+)\s*=\s*"?([^"#\n]*)"?\s*$/);
      if (m) vars[m[1]] = m[2].trim();
    }
    return vars;
  } catch {
    return {};
  }
}

// ── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const docxPath = args.find((a) => !a.startsWith("-"));
const doCommit = args.includes("--commit");

if (!docxPath) {
  console.error("Usage: node scripts/import-devotionals.mjs <file.docx> [--commit]");
  process.exit(1);
}

// ── Extract paragraphs ────────────────────────────────────────────────────────

console.log(`\nParsing ${docxPath} …`);
const { value: html, messages } = await mammoth.convertToHtml({ path: docxPath });

const paragraphs = html
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/(?:p|h[1-6]|li|div|tr)>/gi, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/'|'/g, "'")
  .replace(/"|"/g, '"')
  .replace(/–|—/g, "-")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

console.log(`  Extracted ${paragraphs.length} paragraphs from docx`);
if (messages.length) {
  console.log(`  Mammoth warnings: ${messages.map((m) => m.message).join("; ")}`);
}

// ── State machine parser ──────────────────────────────────────────────────────
// States: SEEKING_DATE | HAS_DATE | HAS_TITLE | HAS_SCRIPTURE
// Structure per entry:
//   1. Date line  (e.g., "July 1 *")
//   2. Title
//   3. Scripture QUOTE (one or more paragraphs — the verse text)
//   4. Scripture REFERENCE (standalone line like "1 Thessalonians 5:16-21")
//   5. Body paragraphs

const devotionals = [];
const parseFlags = [];

let state = "SEEKING_DATE";
let current = null;
let scriptureQuoteLines = [];
let bodyLines = [];

function finalise() {
  if (!current || !current.title) return;
  const ref = current.scripture_ref;
  const quoteText = scriptureQuoteLines.join(" ").trim();
  if (ref) {
    current.scripture = quoteText ? `${ref}` : ref;
  } else if (quoteText) {
    // Try to find an embedded reference pattern within the quote text
    const embeddedMatch = quoteText.match(
      /(?:[1-3]|I{1,3}V?|IV)\s+[A-Z][a-z]+\s+\d+:\d+[\s\w()]*|[A-Z][a-z]+\s+\d+:\d+[\s\w()]*/
    );
    if (embeddedMatch) {
      current.scripture = embeddedMatch[0].trim();
    } else {
      current.scripture = null;
      parseFlags.push({
        date: `${MONTH_NAMES[current.cal_month - 1]} ${current.cal_day}`,
        title: current.title,
        reason: "No scripture reference found",
      });
    }
  } else {
    current.scripture = null;
    parseFlags.push({
      date: `${MONTH_NAMES[current.cal_month - 1]} ${current.cal_day}`,
      title: current.title,
      reason: "No scripture found",
    });
  }

  // If scripture quote lines didn't get consumed by state transition,
  // prepend them to body (happens when ref was embedded in quote text)
  const allBody = [...(ref ? [] : scriptureQuoteLines), ...bodyLines].join("\n\n").trim();
  current.body_html = allBody ? `<p>${allBody.replace(/\n\n/g, "</p><p>")}</p>` : "";

  devotionals.push({
    cal_month: current.cal_month,
    cal_day: current.cal_day,
    title: current.title,
    slug: current.slug,
    scripture: current.scripture,
    body_html: current.body_html,
  });

  current = null;
  scriptureQuoteLines = [];
  bodyLines = [];
}

for (const line of paragraphs) {
  // Stop at extras/appendix sections
  if (STOP_WORDS_RE.test(line)) {
    finalise();
    break;
  }

  const dateMatch = line.match(DATE_RE);
  if (dateMatch) {
    finalise();
    state = "HAS_DATE";
    const monthStr = dateMatch[1];
    const dayStr = dateMatch[2];
    const month = parseMonth(monthStr);
    const day = parseInt(dayStr, 10);
    if (!month || isNaN(day) || day < 1 || day > 31) {
      parseFlags.push({ date: line, title: line, reason: "Date matched regex but values invalid" });
      state = "SEEKING_DATE";
    } else {
      current = { cal_month: month, cal_day: day, title: "", slug: "", scripture_ref: null };
    }
    continue;
  }

  if (state === "SEEKING_DATE" || !current) continue;

  if (state === "HAS_DATE") {
    current.title = line;
    current.slug = toSlug(line, current.cal_month, current.cal_day);
    state = "HAS_TITLE";
    continue;
  }

  if (state === "HAS_TITLE") {
    if (SCRIPTURE_REF_RE.test(line)) {
      current.scripture_ref = line.trim();
      state = "HAS_SCRIPTURE";
    } else {
      scriptureQuoteLines.push(line);
    }
    continue;
  }

  if (state === "HAS_SCRIPTURE") {
    bodyLines.push(line);
  }
}
finalise();

// ── Build report ──────────────────────────────────────────────────────────────

const seen = new Map();
const dupFlags = [];
const deduped = [];
for (const d of devotionals) {
  const k = `${d.cal_month}-${d.cal_day}`;
  if (seen.has(k)) {
    dupFlags.push({
      date: `${MONTH_NAMES[d.cal_month - 1]} ${d.cal_day}`,
      title: d.title,
      reason: `Duplicate — will skip on commit (keeping: "${seen.get(k).title}")`,
    });
  } else {
    seen.set(k, d);
    deduped.push(d);
  }
}

const allFlags = [...parseFlags, ...dupFlags];
const lines = [];
lines.push(`Devotionals import report`);
lines.push(`=`.repeat(60));
lines.push(`File:         ${docxPath}`);
lines.push(`Paragraphs:   ${paragraphs.length}`);
lines.push(`Parsed:       ${devotionals.length} entries`);
lines.push(`Unique dates: ${deduped.length}`);
lines.push(`Issues:       ${allFlags.length} (${dupFlags.length} duplicates, ${parseFlags.length} other)`);
lines.push(``);

if (allFlags.length > 0) {
  lines.push(`ISSUES:`);
  for (const f of allFlags) {
    lines.push(`  [${f.date}] "${f.title}"`);
    lines.push(`    ${f.reason}`);
  }
  lines.push(``);
}

lines.push(`ENTRIES — unique dates (${deduped.length}):`);
for (const d of deduped) {
  const dateStr = `${MONTH_NAMES[d.cal_month - 1]} ${d.cal_day}`.padEnd(15);
  const ref = d.scripture ?? "NO SCRIPTURE";
  const bodyLen = d.body_html?.length ?? 0;
  lines.push(`  ${dateStr}  "${d.title}" [${ref}]  (${bodyLen} chars body)`);
}

const report = lines.join("\n");
writeFileSync("devotionals.report.txt", report, "utf8");
writeFileSync("devotionals.parsed.json", JSON.stringify(deduped, null, 2), "utf8");

console.log(`\n${report}\n`);
console.log(`Written to: devotionals.report.txt + devotionals.parsed.json`);

if (!doCommit) {
  console.log(`\nReview the report and JSON, then re-run with --commit to insert into Supabase.`);
  process.exit(0);
}

// ── Commit to Supabase ────────────────────────────────────────────────────────

console.log(`\nCommitting ${deduped.length} entries to Supabase …`);
const env = readDevVars();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .dev.vars");
  process.exit(1);
}

const sb = createClient(supabaseUrl, serviceKey);

let inserted = 0;
let errored = 0;

for (const d of deduped) {
  const row = {
    title: d.title,
    slug: d.slug,
    scripture: d.scripture ?? null,
    excerpt: null,
    body_html: d.body_html || null,
    image_url: null,
    cal_month: d.cal_month,
    cal_day: d.cal_day,
    status: "draft",
    published_at: null,
    publish_at: null,
  };

  const { error } = await sb
    .from("devotionals")
    .upsert(row, { onConflict: "cal_month,cal_day", ignoreDuplicates: false });

  if (error) {
    console.error(`  ERROR ${MONTH_NAMES[d.cal_month - 1]} ${d.cal_day} "${d.title}": ${error.message}`);
    errored++;
  } else {
    inserted++;
  }
}

console.log(`\nDone: ${inserted} upserted, ${errored} errors`);
