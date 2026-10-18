import { CtaBand } from "@/components/site/CtaBand";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { JsonLd, dealerJsonLd } from "@/components/site/JsonLd";
import { MobileCallBar } from "@/components/site/MobileCallBar";
import { siteUrl } from "@/lib/site-url";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const url = await siteUrl();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-black">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <CtaBand />
      <Footer />
      <MobileCallBar />
      <JsonLd data={dealerJsonLd(url)} />
    </>
  );
}
