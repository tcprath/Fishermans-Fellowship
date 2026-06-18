import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ScrollReveal from "@/components/scroll-reveal";
import CtaBannerWrapper from "@/components/cta-banner-wrapper";
import { Toaster } from "@/components/ui/sonner";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <CtaBannerWrapper />
      <SiteFooter />
      <ScrollReveal />
      <Toaster richColors position="bottom-right" />
    </>
  );
}
