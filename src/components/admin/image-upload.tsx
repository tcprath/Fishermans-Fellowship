"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon, Search } from "lucide-react";
import Image from "next/image";
import PexelsPicker from "@/components/admin/pexels-picker";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

interface ImageUploadProps {
  folder: "posts" | "devotionals" | "events" | "resources";
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({
  folder,
  value,
  onChange,
  label = "Image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pexelsOpen, setPexelsOpen] = useState(false);

  async function handleFile(file: File) {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("JPEG, PNG, or WebP only");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File must be under 5 MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const uuid = crypto.randomUUID();
      const path = `${folder}/${uuid}.${ext}`;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>

      {value ? (
        <div className="relative group w-full">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
            <Image
              src={value}
              alt="Image"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 size-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            title="Remove image"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Upload new
            </button>
            <span className="text-muted-foreground text-xs">·</span>
            <button
              type="button"
              onClick={() => setPexelsOpen(true)}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Image library
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center w-full"
        >
          {uploading ? (
            <div className="text-sm text-muted-foreground animate-pulse">
              Uploading…
            </div>
          ) : (
            <>
              <div
                className="flex flex-col items-center gap-3 cursor-pointer w-full"
                onClick={() => inputRef.current?.click()}
              >
                <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Click or drag to upload</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    JPEG, PNG, WebP · max 5 MB
                  </p>
                  {folder === "devotionals" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 1200 × 630 px
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  className="flex-1 min-w-0"
                >
                  <Upload className="size-3.5 shrink-0" />
                  Upload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPexelsOpen(true)}
                  className="flex-1 min-w-0"
                >
                  <Search className="size-3.5 shrink-0" />
                  Image library
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleChange}
        className="hidden"
      />

      <PexelsPicker
        open={pexelsOpen}
        onOpenChange={setPexelsOpen}
        onSelect={onChange}
      />
    </div>
  );
}
