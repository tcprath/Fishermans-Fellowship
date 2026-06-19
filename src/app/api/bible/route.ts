import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BOOKS, TRANSLATIONS } from "@/lib/bible-data";

// ── hello.ao types ─────────────────────────────────────────────────────────
type ChapterContent =
  | string
  | { text: string; poem?: number }
  | { noteId: number }
  | { lineBreak: true };
type VerseItem = { type: "verse"; number: number; content: ChapterContent[] };
type ChapterItem = VerseItem | { type: string };

function extractHelloaoVerseText(content: ChapterContent[]): string {
  return content
    .filter((c): c is string | { text: string } =>
      typeof c === "string" || (typeof c === "object" && "text" in c)
    )
    .map((c) => (typeof c === "string" ? c : c.text))
    .join("")
    .trim();
}

// ── NLT HTML parser ────────────────────────────────────────────────────────
// Removes a <span class="X">…</span> including any nested spans.
function removeSpanClass(html: string, className: string): string {
  const open = `<span class="${className}">`;
  let result = "";
  let i = 0;
  while (i < html.length) {
    const at = html.indexOf(open, i);
    if (at === -1) { result += html.slice(i); break; }
    result += html.slice(i, at);
    let depth = 1;
    let j = at + open.length;
    while (j < html.length && depth > 0) {
      if (html.slice(j, j + 5) === "<span") { depth++; j++; }
      else if (html.slice(j, j + 7) === "</span>") { depth--; if (depth === 0) j += 7; else j++; }
      else j++;
    }
    i = j;
  }
  return result;
}

function parseNltHtml(html: string): string {
  // Extract all verse_export blocks
  const verseRe = /<verse_export[^>]*>([\s\S]*?)<\/verse_export>/g;
  const verses: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = verseRe.exec(html)) !== null) {
    let v = m[1];
    // Drop structural headings and psalm titles
    v = v.replace(/<h[234][^>]*>[\s\S]*?<\/h[234]>/gi, "");
    v = v.replace(/<p[^>]*class="[^"]*psa-title[^"]*"[^>]*>[\s\S]*?<\/p>/gi, "");
    // Drop verse numbers
    v = v.replace(/<span class="vn">\d+<\/span>/g, "");
    // Drop footnote markers
    v = v.replace(/<a class="a-tn">[^<]*<\/a>/g, "");
    // Drop footnote text (may be nested — use depth-tracking remover)
    v = removeSpanClass(v, "tn");
    // Strip remaining tags
    v = v.replace(/<[^>]+>/g, " ");
    // Normalise whitespace
    v = v.replace(/\s+/g, " ").trim();
    if (v) verses.push(v);
  }
  return verses.join(" ");
}

// ── Route ──────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp            = request.nextUrl.searchParams;
  const translationId = sp.get("translationId");
  const bookName      = sp.get("book");
  const chapter       = sp.get("chapter");
  const verseStart    = sp.get("verseStart");
  const verseEnd      = sp.get("verseEnd") || verseStart;

  if (!translationId || !bookName || !chapter || !verseStart) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const translation = TRANSLATIONS.find((t) => t.id === translationId);
  if (!translation?.apiId || !translation.apiSource) {
    return NextResponse.json({ text: "" }); // reference-only
  }

  const verseRange =
    verseEnd && verseEnd !== verseStart ? `${verseStart}-${verseEnd}` : verseStart;

  // ── ESV ─────────────────────────────────────────────────────────────────
  if (translation.apiSource === "esv") {
    const esvKey = process.env.ESV_API_KEY;
    if (!esvKey) {
      return NextResponse.json({ error: "ESV_API_KEY not configured" }, { status: 500 });
    }
    const url = new URL("https://api.esv.org/v3/passage/text/");
    url.searchParams.set("q", `${bookName} ${chapter}:${verseRange}`);
    url.searchParams.set("include-verse-numbers", "false");
    url.searchParams.set("include-footnotes", "false");
    url.searchParams.set("include-headings", "false");
    url.searchParams.set("include-short-copyright", "false");
    url.searchParams.set("include-passage-references", "false");
    const res = await fetch(url.toString(), { headers: { Authorization: `Token ${esvKey}` } });
    if (!res.ok) return NextResponse.json({ error: "ESV API error" }, { status: 502 });
    const data = (await res.json()) as { passages?: string[] };
    const text = data.passages?.[0]?.trim().replace(/\s+/g, " ") ?? "";
    if (!text) return NextResponse.json({ error: "Verse not found" }, { status: 404 });
    return NextResponse.json({ text });
  }

  // ── NLT (Tyndale) ────────────────────────────────────────────────────────
  if (translation.apiSource === "nlt") {
    const book = BOOKS.find((b) => b.name === bookName);
    if (!book) return NextResponse.json({ error: "Unknown book" }, { status: 400 });
    const key = process.env.NLT_API_KEY ?? "TEST";
    const ref = `${book.nlt}.${chapter}.${verseRange}`;
    const url = `https://api.nlt.to/api/passages?ref=${encodeURIComponent(ref)}&key=${key}`;
    const res = await fetch(url, { headers: { Accept: "text/html" } });
    if (!res.ok) return NextResponse.json({ error: "NLT API error" }, { status: 502 });
    const html = await res.text();
    const text = parseNltHtml(html);
    if (!text) return NextResponse.json({ error: "Verse not found" }, { status: 404 });
    return NextResponse.json({ text });
  }

  // ── bible-api.com (KJV) ──────────────────────────────────────────────────
  if (translation.apiSource === "bible-api") {
    const bookSlug = bookName.toLowerCase().replace(/\s+/g, "+");
    const url = `https://bible-api.com/${bookSlug}+${chapter}:${verseRange}?translation=${translation.apiId}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return NextResponse.json({ error: "Bible API unavailable" }, { status: 502 });
    const data = (await res.json()) as { text?: string; error?: string };
    if (data.error || !data.text) {
      return NextResponse.json({ error: data.error ?? "Verse not found" }, { status: 404 });
    }
    return NextResponse.json({ text: data.text.trim().replace(/\s+/g, " ") });
  }

  // ── hello.ao (BSB, WEB) ──────────────────────────────────────────────────
  if (translation.apiSource === "helloao") {
    const book = BOOKS.find((b) => b.name === bookName);
    if (!book) return NextResponse.json({ error: "Unknown book" }, { status: 400 });
    const url = `https://bible.helloao.org/api/${translation.apiId}/${book.osis}/${chapter}.json`;
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ error: "Chapter not found" }, { status: 502 });
    const data = (await res.json()) as { chapter?: { content?: ChapterItem[] } };
    const content = data.chapter?.content ?? [];
    const start = parseInt(verseStart);
    const end   = parseInt(verseEnd ?? verseStart);
    const text = (content as ChapterItem[])
      .filter((item): item is VerseItem =>
        item.type === "verse" &&
        (item as VerseItem).number >= start &&
        (item as VerseItem).number <= end
      )
      .map((verse) => extractHelloaoVerseText(verse.content))
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");
    if (!text) return NextResponse.json({ error: "Verse not found" }, { status: 404 });
    return NextResponse.json({ text });
  }

  return NextResponse.json({ error: "Unsupported translation source" }, { status: 400 });
}
