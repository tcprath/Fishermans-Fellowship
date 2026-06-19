"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import { createTag } from "@/app/(admin)/admin/tags/actions";
import type { TagRow } from "@/lib/supabase/types";

type Props = {
  allTags: TagRow[];
  value: string[]; // selected tag IDs
  onChange: (ids: string[]) => void;
};

export default function TagPicker({ allTags, value, onChange }: Props) {
  const [tags, setTags] = useState<TagRow[]>(allTags);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setTags(allTags), [allTags]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = value
    .map((id) => tags.find((t) => t.id === id))
    .filter((t): t is TagRow => !!t);

  const query = input.trim().toLowerCase();
  const matches = tags.filter(
    (t) =>
      !value.includes(t.id) &&
      (query === "" || t.name.toLowerCase().includes(query))
  );
  const exactMatch = tags.find((t) => t.name.toLowerCase() === query);
  const canCreate = query.length > 0 && !exactMatch;

  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  }

  function handleCreate() {
    if (!query) return;
    startTransition(async () => {
      const result = await createTag({ name: input.trim() });
      if (!result.success) { toast.error(result.error); return; }
      const tag = result.tag;
      setTags((prev) => (prev.find((t) => t.id === tag.id) ? prev : [...prev, tag]));
      if (!value.includes(tag.id)) onChange([...value, tag.id]);
      setInput("");
      inputRef.current?.focus();
    });
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (matches[0] && !canCreate) toggle(matches[0].id);
      else if (canCreate) handleCreate();
    } else if (e.key === "Backspace" && input === "" && selected.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
        <TagIcon className="size-3.5 text-muted-foreground" />
        Tags
      </label>

      <div
        className="flex flex-wrap gap-1.5 min-h-9 w-full rounded-lg border border-input bg-transparent px-2 py-1.5 text-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-colors cursor-text"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selected.map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--ff-blue)] text-[var(--ff-cream)] px-2.5 py-0.5 text-xs font-medium"
          >
            {t.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle(t.id);
              }}
              className="hover:opacity-80"
              aria-label={`Remove ${t.name}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={selected.length === 0 ? "Add a tag…" : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
        />
      </div>

      {open && (matches.length > 0 || canCreate) && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-border bg-white shadow-lg max-h-60 overflow-auto py-1">
          {matches.slice(0, 8).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                toggle(t.id);
                setInput("");
                inputRef.current?.focus();
              }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2"
            >
              <TagIcon className="size-3 text-muted-foreground" />
              {t.name}
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleCreate}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2 border-t border-border text-[var(--ff-blue)] font-medium disabled:opacity-50"
            >
              <Plus className="size-3.5" />
              Create &ldquo;{input.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-1.5">
        Type to filter, Enter to add, or create a new tag.
      </p>
    </div>
  );
}
