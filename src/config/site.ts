// Every piece of business information lives here. Update this file (not the
// pages) when the client sends hours, email, social links or a new domain.

export const site = {
  name: "Empire Auto Group",
  legalName: "Empire Auto Group LLC",
  tagline: "Driven by Trust. Built for You.",
  description:
    "Quality pre-owned vehicles, maintenance, detailing, trade-ins and help with financing paperwork in Derry, New Hampshire. Empire Auto Group LLC: driven by trust, built for you.",
  // Fallback only: the live address is detected from each request (src/lib/site-url.ts).
  url: "http://localhost:3000",

  phone: "603-858-8844",
  phoneHref: "tel:+16038588844",
  // TODO(client): public email address
  email: "",

  address: {
    street: "44 Manchester Road",
    city: "Derry",
    region: "NH",
    postalCode: "03038",
    country: "US",
  },
  geo: { lat: 42.8813, lng: -71.3489 },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=44+Manchester+Road+Derry+NH+03038",
  mapsEmbed: "https://www.google.com/maps?q=44+Manchester+Road,+Derry,+NH+03038&output=embed",

  // TODO(client): confirm real hours. `null` means closed.
  hours: [
    { day: "Monday", short: "Mo", open: "09:00", close: "18:00" },
    { day: "Tuesday", short: "Tu", open: "09:00", close: "18:00" },
    { day: "Wednesday", short: "We", open: "09:00", close: "18:00" },
    { day: "Thursday", short: "Th", open: "09:00", close: "18:00" },
    { day: "Friday", short: "Fr", open: "09:00", close: "18:00" },
    { day: "Saturday", short: "Sa", open: "10:00", close: "16:00" },
    { day: "Sunday", short: "Su", open: null, close: null },
  ] as { day: string; short: string; open: string | null; close: string | null }[],

  // TODO(client): social profile URLs
  social: {
    facebook: "",
    instagram: "",
    google: "",
  },

  // "Services" opens the dropdown built from src/content/services.ts
  nav: [
    { href: "/", label: "Home" },
    { href: "/inventory", label: "Inventory" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;
