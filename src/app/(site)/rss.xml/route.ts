import { Feed } from "feed";
import { getPublishedPostsByBlog, getPublishedDevotionals, getAllBlogs } from "@/lib/content";

export const revalidate = 60;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fishermansfellowship.com";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Fisherman's Fellowship";

  const feed = new Feed({
    title: siteName,
    description: "Bringing Christian fishermen together to grow in faith.",
    id: siteUrl,
    link: siteUrl,
    language: "en",
    copyright: `© ${new Date().getFullYear()} Fisherman's Fellowship`,
  });

  const [blogs, devotionals] = await Promise.all([getAllBlogs(), getPublishedDevotionals()]);

  for (const blog of blogs) {
    const posts = await getPublishedPostsByBlog(blog.id);
    for (const post of posts) {
      if (!post.published_at) continue;
      feed.addItem({
        title: post.title,
        id: `${siteUrl}/${blog.slug}/${post.slug}`,
        link: `${siteUrl}/${blog.slug}/${post.slug}`,
        description: post.excerpt ?? "",
        content: post.body_html ?? "",
        date: new Date(post.published_at),
        author: post.author ? [{ name: post.author }] : [],
      });
    }
  }

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

  feed.items.sort((a, b) => b.date.getTime() - a.date.getTime());

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
