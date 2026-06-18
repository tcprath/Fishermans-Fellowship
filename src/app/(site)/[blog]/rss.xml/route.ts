import { Feed } from "feed";
import { getBlogBySlug, getPublishedPostsByBlog, getPublishedDevotionals } from "@/lib/content";

export const revalidate = 60;

type Params = { blog: string };

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { blog: slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fishermansfellowship.com";

  const blog = await getBlogBySlug(slug);
  if (!blog) return new Response("Not Found", { status: 404 });

  const feedUrl = `${siteUrl}/${slug}/rss.xml`;

  const feed = new Feed({
    title: blog.name,
    description: blog.description ?? "",
    id: feedUrl,
    link: `${siteUrl}/${slug}`,
    language: "en",
    copyright: `© ${new Date().getFullYear()} Fisherman's Fellowship`,
  });

  const posts = await getPublishedPostsByBlog(blog.id);
  for (const post of posts) {
    if (!post.published_at) continue;
    feed.addItem({
      title: post.title,
      id: `${siteUrl}/${slug}/${post.slug}`,
      link: `${siteUrl}/${slug}/${post.slug}`,
      description: post.excerpt ?? "",
      content: post.body_html ?? "",
      date: new Date(post.published_at),
      author: post.author ? [{ name: post.author }] : [],
    });
  }

  // FF feed includes devotionals
  if (slug === "fishermans-fellowship") {
    const devotionals = await getPublishedDevotionals();
    for (const d of devotionals) {
      if (!d.published_at) continue;
      feed.addItem({
        title: d.title,
        id: `${siteUrl}/devotionals/${d.slug}`,
        link: `${siteUrl}/devotionals/${d.slug}`,
        description: d.excerpt ?? d.scripture ?? "",
        content: d.body_html ?? "",
        date: new Date(d.published_at),
      });
    }
  }

  feed.items.sort((a, b) => b.date.getTime() - a.date.getTime());

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
