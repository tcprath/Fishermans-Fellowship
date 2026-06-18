import type { Metadata } from "next";
import { hankenGrotesk, newsreader } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fisherman's Fellowship",
    template: "%s | Fisherman's Fellowship",
  },
  description:
    "Bringing Christian fishermen together to grow in faith, stand with one another, and share the love of Jesus — on the water and beyond.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://fishermansfellowship.com"
  ),
  openGraph: {
    siteName: "Fisherman's Fellowship",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${newsreader.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
