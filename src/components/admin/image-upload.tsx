"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

interface ImageUploadProps {
  folder: "posts" | "devotionals";
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

export default function ImageUpload({
  folder,
  value,
  onChange,
  label = "Image",
  required = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {value ? (
        <div className="relative group w-full max-w-sm">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
            <Image
              src={value}
              alt="Uploaded image"
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
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 text-xs text-muted-foreground underline hover:text-foreground"
          >
            Replace image
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center cursor-pointer hover:border-ring hover:bg-muted/50 transition-colors max-w-sm"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="text-sm text-muted-foreground animate-pulse">Uploading…</div>
          ) : (
            <>
              <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Click or drag to upload</p>
                <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG, WebP · max 5 MB</p>
                {folder === "devotionals" && (
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 1200 × 630 px (OG image)</p>
                )}
              </div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="size-3.5" />
                Choose file
              </Button>
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
    </div>
  );
}
