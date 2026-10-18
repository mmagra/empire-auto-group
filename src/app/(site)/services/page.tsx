import type { Metadata } from "next";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { fullAddress, site } from "@/config/site";
import { SERVICE_GROUPS, VISIBLE_GROUPS, VISIBLE_SERVICES } from "@/content/services";
import { siteUrl } from "@/lib/site-url";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { HoursList } from "@/components/site/HoursList";
import { JourneyCycle } from "@/components/site/infographics";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { ServiceRequestForm } from "@/components/site/ServiceForms";

export const metadata: Metadata = {
  title: "Our Services: Oil Changes, Brakes, Tires, Repair & Detailing",
  description:
    "Oil changes, brakes, tires, general repair and detailing at Empire Auto Group in Derry, NH. Book your service online or call us.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const base = await siteUrl();
  const groups = VISIBLE_GROUPS;

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title={
          <>
            Everything Your Car <span className="text-gold-grad">Needs</span>
          </>
        }
        intro="Maintenance, repair and detailing to keep your car running and looking like new, all under one roof in Derry."
      >
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#book" className="btn btn-gold px-8">
              Book a Service <ArrowRight className="size-4" />
            </a>
            <a href={site.phoneHref} className="btn btn-ghost px-8">
              <Phone className="size-4" /> {site.phone}
            </a>
          </div>
          <Breadcrumbs baseUrl={base} items={[{ label: "Services" }]} />
        </div>
      </PageHero>

      {groups.map((g, gi) => {
        const items = VISIBLE_SERVICES.filter((s) => s.group === g);
        return (
          <section key={g} className={`py-20 ${gi % 2 ? "border-y border-line bg-surface/50" : ""}`}>
            <div className="container-x">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <SectionHeading align="left" eyebrow={SERVICE_GROUPS[g].text} title={SERVICE_GROUPS[g].title} />
                <p className="text-sm text-muted">
                  {items.length} service{items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className={`mt-10 grid gap-6 sm:grid-cols-2 ${items.length > 3 ? "lg:grid-cols-5" : "lg:grid-cols-3"}`}>
                {items.map((s, i) => (
                  <Reveal key={s.slug} delay={i * 70}>
                    <ServiceCard slug={s.slug} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading
              align="left"
              eyebrow="One Place, Start To Finish"
              title={
                <>
                  Your Car&apos;s <span className="text-gold-grad">Journey</span> With Us
                </>
              }
              intro="Most dealerships stop at the sale. We're with you the whole way: finding the right car, sorting out the paperwork, keeping it maintained and shining, and trading it in when you're ready for the next one."
            />
          </div>
          <JourneyCycle />
        </div>
      </section>

      <section id="book" className="scroll-mt-[calc(var(--header-h)+1rem)]">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          {/* Left column: fills the space beside the tall form and stays in view while scrolling it */}
          <div className="space-y-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <SectionHeading
              align="left"
              eyebrow="Book Service"
              title={
                <>
                  Request An <span className="text-gold-grad">Appointment</span>
                </>
              }
              intro="Tell us what you need and when works for you. We'll call to confirm your appointment time."
            />

            <div>
              <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-ink">What happens next</p>
              <ol className="mt-4 space-y-4">
                {[
                  ["Send your request", "Pick a service and a day that suits you."],
                  ["We call to confirm", "We lock in your time and answer any questions."],
                  ["Drop off your car", "Bring it to Empire Auto Group in Derry."],
                ].map(([title, text], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold-deep font-display text-sm text-black">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-text">{title}</p>
                      <p className="text-sm text-muted">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="dark-zone grid gap-5 rounded-2xl bg-black p-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted">Prefer to talk?</p>
                <a href={site.phoneHref} className="mt-1 flex items-center gap-2 font-display text-xl text-gold">
                  <Phone className="size-5" /> {site.phone}
                </a>
                <a href={site.mapsUrl} target="_blank" rel="noopener" className="mt-3 flex items-start gap-2 text-sm text-muted hover:text-gold">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold" /> {fullAddress}
                </a>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm text-muted">
                  <Clock className="size-4 text-gold" /> Service hours
                </p>
                <HoursList compact className="text-sm" />
              </div>
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            <ServiceRequestForm kind="service" />
          </div>
        </div>
      </section>
    </>
  );
}
