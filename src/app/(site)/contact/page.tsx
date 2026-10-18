import type { Metadata } from "next";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { fullAddress, site } from "@/config/site";
import { HoursList } from "@/components/site/HoursList";
import { LeadForm } from "@/components/site/LeadForm";
import { PageHero } from "@/components/site/PageHero";
import { Select } from "@/components/ui/Select";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact Empire Auto Group at ${site.phone} or visit us at ${fullAddress}.`,
  alternates: { canonical: "/contact" },
};

const TOPICS = ["Buying a vehicle", "Financing paperwork", "Trade-in", "Service / repair", "Detailing", "Something else"];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const preset = (await searchParams).topic;
  const topic = preset === "financing" ? "Financing paperwork" : preset === "trade-in" ? "Trade-in" : "";

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s <span className="text-gold-grad">Talk</span>
          </>
        }
        intro="Questions about a car, financing, your trade or a service appointment? Call, stop by or send us a message."
      />

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-stretch">
          {/* One contact panel that matches the form's height (no gaps) */}
          <aside className="dark-zone relative flex h-full flex-col overflow-hidden rounded-2xl bg-black p-7 sm:p-9">
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold/20 blur-3xl" />
            <div className="relative">
              <p className="eyebrow">Get In Touch</p>
              <h2 className="text-chrome mt-3 font-display text-3xl uppercase leading-tight">We&apos;re Here To Help</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">Call, stop by or send a message. A real person will get back to you.</p>
            </div>

            <ul className="relative mt-8 divide-y divide-gold/20 border-y border-gold/20">
              <li>
                <a href={site.phoneHref} className="group flex items-center gap-4 py-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-gold-light to-gold-deep text-black">
                    <Phone className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted">Call us</span>
                    <span className="block font-display text-xl text-white transition group-hover:text-gold">{site.phone}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={site.mapsUrl} target="_blank" rel="noopener" className="group flex items-center gap-4 py-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-gold-light to-gold-deep text-black">
                    <MapPin className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted">Visit us</span>
                    <span className="block text-white transition group-hover:text-gold">
                      {site.address.street}
                      <br />
                      {site.address.city}, {site.address.region} {site.address.postalCode}
                    </span>
                  </span>
                </a>
              </li>
              {site.email && (
                <li>
                  <a href={`mailto:${site.email}`} className="group flex items-center gap-4 py-5">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-gold-light to-gold-deep text-black">
                      <Mail className="size-5" />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted">Email</span>
                      <span className="block text-white transition group-hover:text-gold">{site.email}</span>
                    </span>
                  </a>
                </li>
              )}
            </ul>

            <div className="relative mt-8">
              <p className="flex items-center gap-2 font-display text-sm uppercase tracking-[0.2em] text-gold">
                <Clock className="size-4" /> Business Hours
              </p>
              <HoursList compact className="mt-4 text-sm" />
            </div>

            {/* Pushed to the bottom so the panel always fills its height neatly */}
            <a href={site.mapsUrl} target="_blank" rel="noopener" className="btn btn-gold relative mt-8 w-full lg:mt-auto">
              <Navigation className="size-4" /> Get Directions
            </a>
          </aside>

          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-2xl uppercase text-text">Send a Message</h2>
            <p className="mb-6 mt-1 text-sm text-muted">We usually reply the same business day.</p>
            <LeadForm type="CONTACT">
              <div>
                <label className="label" htmlFor="c-topic">
                  Topic
                </label>
                <Select id="c-topic" name="d_topic" defaultValue={topic} options={[{ value: "", label: "Select a topic" }, ...TOPICS]} />
              </div>
            </LeadForm>
          </div>
        </div>
      </section>

      <section className="container-x">
        <div className="card relative h-[26rem] overflow-hidden">
          <iframe
            title={`Map to ${site.name}`}
            src={site.mapsEmbed}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a href={site.mapsUrl} target="_blank" rel="noopener" className="btn btn-gold absolute bottom-4 left-4">
            <Navigation className="size-4" /> Get Directions
          </a>
        </div>
      </section>
    </>
  );
}
