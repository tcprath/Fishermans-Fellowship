"use client";

import { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { toast } from "sonner";

type Props = { url: string; title: string };

export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled — fall through to manual buttons
      }
    }
    // fallback: copy link
    await copyLink();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[rgba(244,237,229,.3)] text-[var(--ff-cream)] hover:bg-[rgba(244,237,229,.1)] transition-colors text-sm font-medium"
        aria-label="Share this devotional"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      {/* Manual fallbacks shown on non-share-API browsers */}
      <a
        href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-full border border-[rgba(244,237,229,.3)] text-[var(--ff-cream)] hover:bg-[rgba(244,237,229,.1)] transition-colors text-xs font-bold leading-none"
        aria-label="Share on X"
      >
        𝕏
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-full border border-[rgba(244,237,229,.3)] text-[var(--ff-cream)] hover:bg-[rgba(244,237,229,.1)] transition-colors text-xs font-bold leading-none"
        aria-label="Share on Facebook"
      >
        f
      </a>
      <button
        onClick={copyLink}
        className="p-2.5 rounded-full border border-[rgba(244,237,229,.3)] text-[var(--ff-cream)] hover:bg-[rgba(244,237,229,.1)] transition-colors"
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-[var(--ff-gold)]" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
