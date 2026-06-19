"use server";

import { createClient } from "@/lib/supabase/server";

export type UrlMetadata = {
  title?: string;
  description?: string;
  image?: string;
  author?: string;
  siteName?: string;
};

export type FetchMetadataResult =
  | { success: true; meta: UrlMetadata }
  | { success: false; error: string };

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
}

function decode(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function meta(html: string, prop: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decode(m[1]);
  }
  return undefined;
}

export async function fetchUrlMetadata(url: string): Promise<FetchMetadataResult> {
  try {
    await requireAuth();

    if (!/^https?:\/\//.test(url)) {
      return { success: false, error: "URL must start with http(s)://" };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; FishermansFellowshipBot/1.0; +https://fishermansfellowship.org)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { success: false, error: `Fetch failed: ${res.status}` };
    }

    const html = (await res.text()).slice(0, 200_000);

    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

    const m: UrlMetadata = {
      title:
        meta(html, "og:title") ??
        meta(html, "twitter:title") ??
        (titleTag ? decode(titleTag).trim() : undefined),
      description:
        meta(html, "og:description") ??
        meta(html, "twitter:description") ??
        meta(html, "description"),
      image:
        meta(html, "og:image") ??
        meta(html, "og:image:url") ??
        meta(html, "twitter:image"),
      author:
        meta(html, "article:author") ??
        meta(html, "author") ??
        meta(html, "book:author"),
      siteName: meta(html, "og:site_name"),
    };

    // YouTube fallback: pull channel name from JSON
    if (/youtube\.com|youtu\.be/.test(url) && !m.author) {
      const channel = html.match(/"ownerChannelName"\s*:\s*"([^"]+)"/)?.[1];
      if (channel) m.author = decode(channel);
    }

    return { success: true, meta: m };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch metadata",
    };
  }
}
