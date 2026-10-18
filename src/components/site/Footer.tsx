import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/config/site";
import { VISIBLE_SERVICES, serviceHref } from "@/content/services";
import { HoursList } from "./HoursList";
import { SocialLinks } from "./SocialLinks";

const COMPANY = [
  ["/", "Home"],
  ["/inventory", "View Inventory"],
  ["/services", "All Services"],
  ["/contact", "Contact"],
  ["/privacy", "Privacy Policy"],
];

export function Footer() {
  return (
    <footer className="dark-zone relative mt-16 border-t border-line bg-black pb-24 lg:pb-0">
      <div className="gold-rule absolute inset-x-0 top-0 opacity-60" />
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.8fr_1.2fr]">
        <div>
          <Image src="/brand/logo-full.webp" alt={site.legalName} width={1400} height={727} className="h-auto w-56" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
            Quality pre-owned vehicles, honest service and real help with financing paperwork, right here in Derry, NH.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-text/85">
            <li>
              <a href={site.mapsUrl} target="_blank" rel="noopener" className="flex gap-3 hover:text-gold">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>
                  {site.address.street}, {site.address.city}, {site.address.region} {site.address.postalCode}
                </span>
              </a>
            </li>
            <li>
              <a href={site.phoneHref} className="flex gap-3 hover:text-gold">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold" /> {site.phone}
              </a>
            </li>
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`} className="flex gap-3 hover:text-gold">
                  <Mail className="mt-0.5 size-4 shrink-0 text-gold" /> {site.email}
                </a>
              </li>
            )}
          </ul>
          <SocialLinks className="mt-6" />
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">Services</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {VISIBLE_SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={serviceHref(s)} className="flex items-center gap-2 text-text/80 transition-colors hover:text-gold">
                  <s.icon className="size-3.5 text-gold/70" /> {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">Company</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {COMPANY.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-text/80 transition-colors hover:text-gold">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-display text-sm uppercase tracking-[0.2em] text-gold">
            <Clock className="size-4" /> Hours
          </h3>
          <HoursList className="mt-5 text-sm" />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-subtle sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <span className="font-display uppercase tracking-[0.18em] text-muted">{site.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
