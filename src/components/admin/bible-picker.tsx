"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Loader2 } from "lucide-react";
import { BOOKS, TRANSLATIONS } from "@/lib/bible-data";

interface BiblePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (scripture: string, excerpt: string) => void;
}

const sel =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

const numInput =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// Default: John 3:16 KJV
const DEFAULT_BOOK = 42; // 0-based index for John
const DEFAULT_CHAPTER = 3;
const DEFAULT_VERSE = 16;

export default function BiblePicker({
  open,
  onOpenChange,
  onSelect,
}: BiblePickerProps) {
  const [translationId, setTranslationId] = useState("kjv");
  const [bookIndex, setBookIndex] = useState(DEFAULT_BOOK); // 0-based
  const [chapter, setChapter] = useState(DEFAULT_CHAPTER);
  const [verseStart, setVerseStart] = useState(DEFAULT_VERSE);
  const [verseEnd, setVerseEnd] = useState(DEFAULT_VERSE);
  const [isRange, setIsRange] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const book = BOOKS[bookIndex];
  const translation = TRANSLATIONS.find((t) => t.id === translationId)!;
  const chapterCount = book?.chapters ?? 1;
  const endVerse = isRange ? verseEnd : verseStart;

  function getReference() {
    const range = isRange && verseEnd > verseStart ? `-${verseEnd}` : "";
    return `${book.name} ${chapter}:${verseStart}${range} (${translation.short})`;
  }

  const fetchVerse = useCallback(async () => {
    if (!translation.apiSource) {
      setPreviewText("");
      setFetchError(null);
      return;
    }
    setFetching(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        translationId: translation.id,
        book: book.name,
        chapter: String(chapter),
        verseStart: String(verseStart),
        verseEnd: String(endVerse),
      });
      const res = await fetch(`/api/bible?${params}`);
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Not found");
      setPreviewText(data.text ?? "");
    } catch {
      setFetchError("Text preview unavailable for this reference");
      setPreviewText("");
    } finally {
      setFetching(false);
    }
  }, [translation, book, chapter, verseStart, endVerse]);

  // Debounced auto-fetch
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(fetchVerse, 350);
    return () => clearTimeout(id);
  }, [open, fetchVerse]);

  function handleBookChange(idx: number) {
    setBookIndex(idx);
    setChapter(1);
    setVerseStart(1);
    setVerseEnd(1);
    setPreviewText("");
  }

  function handleChapterChange(ch: number) {
    setChapter(ch);
    setVerseStart(1);
    setVerseEnd(1);
    setPreviewText("");
  }

  function handleVerseStartChange(v: number) {
    const clamped = Math.max(1, v);
    setVerseStart(clamped);
    if (verseEnd < clamped) setVerseEnd(clamped);
  }

  function handleInsert() {
    onSelect(getReference(), previewText);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90dvh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="size-4" />
            Choose Scripture
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain space-y-4 pt-1 pr-1">
          {/* Translation */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Translation
            </label>
            <select
              value={translationId}
              onChange={(e) => {
                setTranslationId(e.target.value);
                setPreviewText("");
              }}
              className={sel}
            >
              {TRANSLATIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.short} — {t.name}
                </option>
              ))}
            </select>
            {!translation.apiSource && (
              <p className="text-xs text-muted-foreground mt-1">
                {translation.short} is a copyrighted translation — reference only. Enter excerpt manually.
              </p>
            )}
          </div>

          {/* Book + Chapter */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Book
              </label>
              <select
                value={bookIndex}
                onChange={(e) => handleBookChange(parseInt(e.target.value))}
                className={sel}
              >
                {BOOKS.map((b, i) => (
                  <option key={i} value={i}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-20">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Chapter
              </label>
              <select
                value={chapter}
                onChange={(e) => handleChapterChange(parseInt(e.target.value))}
                className={sel}
              >
                {Array.from({ length: chapterCount }, (_, i) => i + 1).map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Verse */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground">Verse</label>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRange}
                  onChange={(e) => setIsRange(e.target.checked)}
                  className="size-3 rounded"
                />
                Range
              </label>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">{isRange ? "From" : "Verse"}</p>
                <input
                  type="number"
                  min={1}
                  max={176}
                  value={verseStart}
                  onChange={(e) => handleVerseStartChange(parseInt(e.target.value) || 1)}
                  className={numInput}
                />
              </div>
              <span className={`text-sm text-muted-foreground mt-4 transition-opacity ${isRange ? "opacity-100" : "opacity-0"}`}>
                –
              </span>
              <div className={`transition-opacity ${isRange ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                <p className="text-[10px] text-muted-foreground mb-1">To</p>
                <input
                  type="number"
                  min={verseStart}
                  max={176}
                  value={verseEnd}
                  disabled={!isRange}
                  onChange={(e) =>
                    setVerseEnd(Math.max(verseStart, parseInt(e.target.value) || verseStart))
                  }
                  className={numInput}
                />
              </div>
            </div>
          </div>

          {/* Verse preview */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 min-h-[64px] max-h-36 overflow-y-auto flex items-start">
            {fetching ? (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Fetching verse…
              </span>
            ) : previewText ? (
              <p className="text-sm leading-relaxed italic text-foreground">
                &ldquo;{previewText}&rdquo;
              </p>
            ) : fetchError ? (
              <p className="text-xs text-muted-foreground">{fetchError}</p>
            ) : !translation.apiSource ? (
              <p className="text-xs text-muted-foreground">
                No text preview for {translation.short} (copyrighted)
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Verse text will appear here</p>
            )}
          </div>

          {/* Reference badge */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5">
              Reference
            </p>
            <p className="text-sm font-medium">{getReference()}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleInsert} disabled={fetching}>
            <BookOpen className="size-3.5" />
            Insert reference
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
