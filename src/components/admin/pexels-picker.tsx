"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Loader2 } from "lucide-react";

interface PexelsPhoto {
  id: number;
  src: { large2x: string; medium: string };
  photographer: string;
  alt: string;
}

interface PexelsPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export default function PexelsPicker({
  open,
  onOpenChange,
  onSelect,
}: PexelsPickerProps) {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/pexels?q=${encodeURIComponent(query.trim())}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as { photos?: PexelsPhoto[]; error?: string };
      if (data.error) throw new Error(data.error);
      setPhotos(data.photos ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [query]);

  function handleSelect(photo: PexelsPhoto) {
    onSelect(photo.src.large2x);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[82vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle>Search Pexels</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search royalty-free photos…"
              onKeyDown={(e) => e.key === "Enter" && search()}
              autoFocus
            />
            <Button
              type="button"
              onClick={search}
              disabled={loading || !query.trim()}
              size="sm"
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Search
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 min-h-0">
          {error && (
            <p className="text-sm text-destructive text-center py-8">{error}</p>
          )}
          {!error && loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!error && !loading && searched && photos.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
          {!error && !loading && !searched && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Search for royalty-free photos from Pexels
            </p>
          )}
          {!loading && photos.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => handleSelect(photo)}
                    className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-ring hover:ring-2 hover:ring-ring/30 transition-all"
                  >
                    <Image
                      src={photo.src.medium}
                      alt={photo.alt || `Photo by ${photo.photographer}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">
                        {photo.photographer}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Photos from{" "}
                <a
                  href="https://www.pexels.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Pexels
                </a>
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
