"use client";

import { usePathname } from "next/navigation";
import CtaBanner from "@/components/cta-banner";

const EXCLUDED = ["/"];

export default function CtaBannerWrapper() {
  const pathname = usePathname();
  if (EXCLUDED.includes(pathname)) return null;
  return <CtaBanner />;
}
