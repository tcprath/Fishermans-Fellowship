import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q");
  if (!q?.trim()) return NextResponse.json({ photos: [] });

  const key = process.env.PEXELS_API_KEY;
  if (!key)
    return NextResponse.json(
      { error: "PEXELS_API_KEY not configured" },
      { status: 500 }
    );

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", q.trim());
  url.searchParams.set("per_page", "20");
  url.searchParams.set("orientation", "landscape");

  const res = await fetch(url.toString(), {
    headers: { Authorization: key },
  });

  if (!res.ok)
    return NextResponse.json({ error: "Pexels API error" }, { status: 502 });

  const data = (await res.json()) as { photos?: unknown[] };
  return NextResponse.json({ photos: data.photos ?? [] });
}
