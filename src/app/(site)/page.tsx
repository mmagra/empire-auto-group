import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Clock, Handshake, MapPin, Phone, Search, ShieldCheck, Users } from "lucide-react";
import { fullAddress, site } from "@/config/site";
import { bodyStyleCounts, featuredVehicles, inventoryFacets } from "@/lib/vehicles";
import { FinancingSection } from "@/components/site/FinancingSection";
import { HeroVideo } from "@/components/site/HeroVideo";
import { HoursList } from "@/components/site/HoursList";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { VISIBLE_SERVICES } from "@/content/services";
import { BodyStyleShop, JourneyCycle } from "@/components/site/infographics";
import { ServiceCard } from "@/components/site/ServiceCard";
import { VehicleCard } from "@/components/site/VehicleCard";
import { Select } from "@/components/ui/Select";

export const dynamic = "force-dynamic";

const PRICE_STEPS = [10000, 15000, 20000, 25000, 30000, 40000, 50000];

const WHY = [
  { icon: ShieldCheck, title: "Inspected Vehicles", text: "Every car is checked over before it hits our lot, so you buy with confidence." },
  { icon: Handshake, title: "Honest Pricing", text: "Clear, upfront prices with no games. What you see is what you pay." },
  { icon: Users, title: "Local & Family-Run Feel", text: "We're your neighbors in Derry. We treat every customer like family." },
  { icon: Award, title: "One-Stop Shop", text: "Buy, trade, service and detail, plus help with financing paperwork, all in one place." },
];

export default async function HomePage() {
  const [vehicles, facets, bodyCounts] = await Promise.all([featuredVehicles(8), inventoryFacets(), bodyStyleCounts()]);

  return (
    <>
      {/* ───────── Hero: full-screen car video ───────── */}
      <section className="dark-zone relative flex min-h-[100svh] items-center overflow-hidden bg-black pb-32 pt-[calc(var(--header-h)+2rem)]">
        <HeroVideo />

        <div className="container-x relative">
          <div className="max-w-4xl">
            <p className="eyebrow animate-fade-up !text-gold-ink before:!hidden">Derry, New Hampshire</p>
            <h1 className="mt-5 animate-fade-up font-display text-5xl uppercase leading-[0.98] [animation-delay:100ms] sm:text-6xl lg:text-7xl">
              <span className="sr-only">{site.legalName}: </span>
              <span className="block text-white drop-shadow-[0_4px_24px_rgb(0_0_0/0.5)]">Driven by Trust.</span>
              <span className="text-gold-grad block drop-shadow-[0_4px_24px_rgb(0_0_0/0.35)]">Built for You.</span>
            </h1>
            <p className="mt-7 max-w-xl animate-fade-up text-base leading-relaxed text-white/85 [animation-delay:200ms] sm:text-lg">
              Quality pre-owned vehicles, full-service maintenance, detailing, trade-ins and real help with your financing paperwork, all under one roof
              in Derry, NH.
            </p>
            <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:280ms] sm:flex-row">
              <Link href="/inventory" className="btn btn-gold px-8 py-4 text-base">
                View Inventory <ArrowRight className="size-5" />
              </Link>
              <a href={site.phoneHref} className="btn btn-ghost border-white/30 bg-white/10 px-8 py-4 text-base text-white backdrop-blur-md">
                <Phone className="size-5" /> Call {site.phone}
              </a>
            </div>
            <ul className="mt-10 flex animate-fade-up flex-wrap gap-x-6 gap-y-2 text-sm text-white/80 [animation-delay:360ms]">
              {["Quality Pre-Owned", "Financing Paperwork Help", "Trade-Ins Welcome", "Service & Detailing"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </section>

      {/* ───────── Quick search (overlaps the hero) ───────── */}
      <div id="search" className="container-x relative z-10 -mt-14">
        <form
          action="/inventory"
          className="card mx-auto grid max-w-5xl gap-3 p-4 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:p-5"
        >
          <div>
            <label className="label" htmlFor="qs-make">
              Make
            </label>
            <Select id="qs-make" name="make" options={[{ value: "", label: "Any make" }, ...facets.makes]} />
          </div>
          <div>
            <label className="label" htmlFor="qs-body">
              Body style
            </label>
            <Select id="qs-body" name="body" options={[{ value: "", label: "Any body style" }, ...facets.bodies]} />
          </div>
          <div>
            <label className="label" htmlFor="qs-price">
              Max price
            </label>
            <Select
              id="qs-price"
              name="maxPrice"
              options={[{ value: "", label: "Any price" }, ...PRICE_STEPS.map((p) => ({ value: p, label: `Under $${p.toLocaleString()}` }))]}
            />
          </div>
          <button className="btn btn-gold self-end py-[0.8rem]">
            <Search className="size-4" /> Search Cars
          </button>
        </form>
      </div>

      {/* ───────── Featured inventory ───────── */}
      <section className="pb-24 pt-20">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading align="left" eyebrow="On The Lot" title={<>Featured <span className="text-gold-grad">Vehicles</span></>} />
            <Link href="/inventory" className="btn btn-ghost shrink-0">
              View all inventory <ArrowRight className="size-4" />
            </Link>
          </div>

          {vehicles.length ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {vehicles.map((v, i) => (
                <Reveal key={v.id} delay={(i % 4) * 80}>
                  <VehicleCard v={v} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="card mt-12 p-12 text-center">
              <p className="font-display text-xl uppercase text-text">New inventory arriving soon</p>
              <p className="mt-2 text-muted">
                Call <a href={site.phoneHref} className="text-gold-ink">{site.phone}</a> to ask about what&apos;s coming in.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ───────── Shop by body style ───────── */}
      <section className="pb-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="Shop By Style"
            title={
              <>
                What Are You <span className="text-gold-grad">Looking For?</span>
              </>
            }
          />
          <Reveal className="mt-12">
            <BodyStyleShop counts={bodyCounts} />
          </Reveal>
        </div>
      </section>

      {/* ───────── Why us: black band, split layout (deliberately unlike the card rows around it) ───────── */}
      <section className="dark-zone relative overflow-hidden bg-black py-24">
        <div className="gold-rule absolute inset-x-0 top-0 opacity-40" />
        <div className="gold-rule absolute inset-x-0 bottom-0 opacity-40" />
        <div className="pointer-events-none absolute -left-40 top-1/2 size-[30rem] -translate-y-1/2 rounded-full bg-gold/15 blur-3xl" />
        {/* Faint brand watermark for depth */}
        <span className="pointer-events-none absolute -bottom-10 right-0 select-none font-display text-[9rem] uppercase leading-none text-white/[0.03] sm:text-[13rem] lg:text-[16rem]" aria-hidden>
          Empire
        </span>

        <div className="container-x relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="eyebrow">Why Empire</p>
            <h2 className="text-chrome mt-4 font-display text-4xl uppercase leading-[1.02] sm:text-5xl">
              Driven by <span className="text-gold-grad">Trust.</span>
              <br />
              Built for You.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
              Buying a car is a big decision. We keep it simple, honest and friendly, from the first question to every service visit after.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="btn btn-gold px-7">
                Talk to Us <ArrowRight className="size-4" />
              </Link>
              <a href={site.phoneHref} className="btn btn-ghost px-7">
                <Phone className="size-4" /> {site.phone}
              </a>
            </div>
          </Reveal>

          <ol className="grid sm:grid-cols-2">
            {WHY.map((w, i) => (
              <Reveal
                key={w.title}
                as="li"
                delay={i * 80}
                className={`group relative border-t border-gold/25 py-8 sm:px-7 ${i % 2 === 0 ? "sm:border-r sm:pl-0" : "sm:pr-0"} ${i < 2 ? "sm:border-t-0 sm:pt-0" : ""}`}
              >
                {/* gold accent that slides in on hover */}
                <span className={`absolute left-0 top-0 h-0.5 w-0 bg-gold transition-all duration-500 group-hover:w-16 ${i < 2 ? "sm:hidden" : ""} ${i % 2 === 1 ? "sm:left-7" : ""}`} />
                <div className="flex items-center gap-4">
                  <span className="font-display text-5xl leading-none text-transparent transition-colors duration-300 [-webkit-text-stroke:1.5px_rgb(245_197_24/0.55)] group-hover:text-gold group-hover:[-webkit-text-stroke:1.5px_rgb(245_197_24)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex size-12 items-center justify-center rounded-full border border-gold/40 text-gold transition duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-black">
                    <w.icon className="size-5" strokeWidth={1.75} />
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg uppercase text-white">{w.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{w.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Services ───────── */}
      <section className="relative border-y border-line bg-surface/50 py-24">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow="What We Do"
              title={
                <>
                  Everything Your Car <span className="text-gold-grad">Needs</span>
                </>
              }
              intro="From finding your next vehicle to keeping it running like new, Empire Auto Group has you covered."
            />
            <Link href="/services" className="btn btn-ghost shrink-0">
              All services <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {VISIBLE_SERVICES.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 4) * 70}>
                <ServiceCard slug={s.slug} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Financing ───────── */}
      <FinancingSection />

      {/* ───────── Trade-in ───────── */}
      <section className="py-6">
        <div className="container-x">
          <Reveal>
            <div className="dark-zone relative grid overflow-hidden rounded-3xl border border-gold/40 bg-[linear-gradient(120deg,#1a1405_0%,#0b0b0c_45%,#111113_100%)] lg:grid-cols-[1.1fr_1fr]">
              <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-gold/20 blur-3xl" />

              {/* Text */}
              <div className="relative p-8 sm:p-12 lg:p-14">
                <p className="eyebrow">Trade-In</p>
                <h2 className="text-chrome mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
                  What&apos;s Your Car <span className="text-gold-grad">Worth?</span>
                </h2>
                <p className="mt-4 max-w-xl text-muted">
                  Tell us about your current vehicle and we&apos;ll get back to you with a fair offer you can put toward your next car.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/contact?topic=trade-in" className="btn btn-gold px-8">
                    Ask About Trade-In <ArrowRight className="size-4" />
                  </Link>
                  <a href={site.phoneHref} className="btn btn-ghost px-8">
                    <Phone className="size-4" /> {site.phone}
                  </a>
                </div>
              </div>

              {/* Photo */}
              <div className="relative min-h-64 sm:min-h-80 lg:min-h-full">
                <Image src="/images/services/trade-in.webp" alt="Hand holding out car keys" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 lg:bg-gradient-to-r lg:from-[#0b0b0c] lg:via-black/40 lg:to-transparent" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Journey infographic ───────── */}
      <section className="py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Start To Finish"
              title={
                <>
                  We&apos;re With You <span className="text-gold-grad">The Whole Way</span>
                </>
              }
              intro="Most dealerships stop at the sale. We help you find the right car, sort out the paperwork, keep it maintained and shining, and trade it in when you're ready for the next one."
            />
            <Link href="/services" className="btn btn-gold mt-8">
              Explore Our Services <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <JourneyCycle />
          </Reveal>
        </div>
      </section>

      {/* ───────── Visit ───────── */}
      <section className="pb-6">
        <div className="container-x grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="card min-h-80 overflow-hidden">
            <iframe
              title={`Map to ${site.name}`}
              src={site.mapsEmbed}
              className="h-full min-h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
          <Reveal delay={100} className="card p-8">
            <p className="eyebrow">Visit Us</p>
            <h2 className="text-chrome mt-3 font-display text-3xl uppercase">Come See Us</h2>
            <a href={site.mapsUrl} target="_blank" rel="noopener" className="mt-5 flex items-start gap-3 text-text/90 hover:text-gold-ink">
              <MapPin className="mt-0.5 size-5 shrink-0 text-gold-ink" /> {fullAddress}
            </a>
            <a href={site.phoneHref} className="mt-3 flex items-center gap-3 text-text/90 hover:text-gold-ink">
              <Phone className="size-5 text-gold-ink" /> {site.phone}
            </a>
            <div className="mt-6 flex items-center gap-2 font-display text-sm uppercase tracking-[0.18em] text-gold-ink">
              <Clock className="size-4" /> Hours
            </div>
            <HoursList className="mt-3 text-sm" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
