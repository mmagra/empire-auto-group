import { fullAddress, site } from "@/config/site";

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe once "<" is escaped.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function dealerJsonLd(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["AutoDealer", "AutoRepair"],
    "@id": `${url}/#dealer`,
    name: site.legalName,
    alternateName: site.name,
    slogan: site.tagline,
    url,
    logo: `${url}/brand/logo-full.png`,
    image: `${url}/brand/og-default.jpg`,
    telephone: "+1-603-858-8844",
    ...(site.email ? { email: site.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    openingHoursSpecification: site.hours
      .filter((h) => h.open)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${h.day}`,
        opens: h.open,
        closes: h.close,
      })),
    areaServed: ["Derry, NH", "Londonderry, NH", "Windham, NH", "Salem, NH", "Hampstead, NH", "Manchester, NH"],
    description: `${site.description} ${fullAddress}.`,
    sameAs: Object.values(site.social).filter(Boolean),
  };
}
