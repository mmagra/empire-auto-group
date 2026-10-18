import type { Metadata, Viewport } from "next";
import { Inter, Russo_One } from "next/font/google";
import { site } from "@/config/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const russo = Russo_One({ subsets: ["latin"], weight: "400", variable: "--font-russo", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  return { ...baseMetadata, metadataBase: new URL(await siteUrl()) };
}

const baseMetadata: Metadata = {
  title: {
    default: `${site.name} | Used Cars, Service & Detailing in Derry, NH`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    images: [{ url: "/brand/og-default.jpg", width: 1200, height: 630, alt: site.legalName }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${russo.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
