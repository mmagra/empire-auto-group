import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronDown, MapPin, Phone } from "lucide-react";
import { site } from "@/config/site";
import { SERVICE_GROUPS, SERVICES, VISIBLE_SERVICES, serviceBySlug, serviceHref } from "@/content/services";
import { siteUrl } from "@/lib/site-url";
import { bodyStyleCounts } from "@/lib/vehicles";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProcessSteps, ServiceInfographic } from "@/components/site/infographics";
import { JsonLd } from "@/components/site/JsonLd";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceCard } from "@/components/site/ServiceCard";
import { FORM_COPY, ServiceRequestForm } from "@/components/site/ServiceForms";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = serviceBySlug((await params).slug);
  if (!s) return {};
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: serviceHref(s) },
    // Hidden pages work by direct link only: keep them out of search results.
    ...(s.hidden ? { robots: { index: false, follow: false } } : {}),
    openGraph: { title: `${s.name} | ${site.name}`, description: s.metaDescription, images: [{ url: `${s.image}.webp` }] },
  };
}

export default async function ServicePage({ params }: Props) {
  const s = serviceBySlug((await params).slug);
  if (!s) notFound();

  const [base, bodyCounts] = await Promise.all([siteUrl(), s.infographic === "buying-journey" ? bodyStyleCounts() : Promise.resolve({})]);
  // Only suggest pages that are linked on the site; top up so there are always three.
  const relatedVisible = s.related.map(serviceBySlug).filter((r): r is NonNullable<typeof r> => r !== undefined && !r.hidden);
  const related = [...relatedVisible, ...VISIBLE_SERVICES.filter((v) => v.slug !== s.slug && !relatedVisible.includes(v))].slice(0, 3);
  const formCopy = FORM_COPY[s.form];
  const ctaIsForm = s.cta.href.startsWith("#");

  return (
    <>
      {/* ───────── Hero: split text + photo ───────── */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-surface-2 to-ink pb-16 pt-[calc(var(--header-h)+2rem)]">
        <div className="pointer-events-none absolute -left-40 top-0 size-[32rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="container-x relative">
          <Breadcrumbs baseUrl={base} items={[{ label: "Services", href: "/services" }, { label: s.name }]} />
          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="eyebrow animate-fade-up">{SERVICE_GROUPS[s.group].title}</p>
              <h1 className="text-chrome mt-4 animate-fade-up font-display text-4xl uppercase leading-[1.02] [animation-delay:80ms] sm:text-5xl lg:text-6xl">
                {s.heroTitle[0]} <span className="text-gold-grad">{s.heroTitle[1]}</span>
              </h1>
              <p className="mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-muted [animation-delay:160ms] sm:text-lg">{s.intro}</p>
              <div className="mt-8 flex animate-fade-up flex-col gap-3 [animation-delay:240ms] sm:flex-row">
                {ctaIsForm ? (
                  <a href={s.cta.href} className="btn btn-gold px-7">
                    {s.cta.label} <ArrowRight className="size-4" />
                  </a>
                ) : (
                  <Link href={s.cta.href} className="btn btn-gold px-7">
                    {s.cta.label} <ArrowRight className="size-4" />
                  </Link>
                )}
                <a href={site.phoneHref} className="btn btn-ghost px-7">
                  <Phone className="size-4" /> {site.phone}
                </a>
              </div>
            </div>

            <div className="relative animate-fade-up [animation-delay:200ms]">
              <div className="absolute -inset-3 rotate-2 rounded-[2rem] border-2 border-gold/40" />
              <div className="relative aspect-[16/11] overflow-hidden rounded-[1.75rem] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)]">
                <Image src={`${s.image}.webp`} alt={s.imageAlt} fill priority sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="dark-zone absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl border border-gold/40 bg-black/90 px-4 py-3 shadow-xl backdrop-blur sm:left-8">
                <span className="flex size-10 items-center justify-center rounded-xl bg-gold text-black">
                  <s.icon className="size-5" />
                </span>
                <div>
                  <p className="font-display text-sm uppercase text-white">{s.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <MapPin className="size-3" /> Derry, NH
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Highlights ───────── */}
      <section className="py-20">
        <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {s.highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 70} className="card group p-6 transition hover:-translate-y-1 hover:border-gold/60">
              <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-b from-gold-light to-gold-deep text-black shadow-[0_8px_24px_-8px_rgb(245_197_24/0.6)]">
                <h.icon className="size-6" />
              </span>
              <h2 className="mt-5 font-display text-lg uppercase leading-tight text-text">{h.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{h.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────── Infographic ───────── */}
      {s.infographic && (
        <div className="-my-20">
          <ServiceInfographic kind={s.infographic} bodyCounts={bodyCounts} />
        </div>
      )}

      {/* ───────── Process ───────── */}
      <section className="py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="How It Works"
            title={
              <>
                Simple, <span className="text-gold-grad">Step By Step</span>
              </>
            }
          />
          <div className="mt-14">
            <ProcessSteps steps={s.process} />
          </div>
        </div>
      </section>

      {/* ───────── Includes + form ───────── */}
      <section id="form" className="scroll-mt-[calc(var(--header-h)+1rem)] border-y border-line bg-surface/50 py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.25fr]">
          <div>
            <SectionHeading
              align="left"
              eyebrow={s.form === "financing" ? "What To Bring" : "What's Included"}
              title={
                <>
                  {s.form === "financing" ? "Come" : "Everything"} <span className="text-gold-grad">{s.form === "financing" ? "Prepared" : "Covered"}</span>
                </>
              }
            />
            <ul className="mt-8 space-y-3">
              {s.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-text/90">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold">
                    <Check className="size-3.5 text-black" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="dark-zone mt-8 rounded-2xl bg-black p-6">
              <p className="text-sm text-muted">Prefer to talk?</p>
              <a href={site.phoneHref} className="mt-1 flex items-center gap-2 font-display text-2xl text-gold">
                <Phone className="size-5" /> {site.phone}
              </a>
              <p className="mt-2 text-sm text-muted">44 Manchester Road, Derry, NH</p>
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-2xl uppercase text-text">{formCopy.title}</h2>
            <p className="mb-6 mt-1 text-sm text-muted">{formCopy.text}</p>
            <ServiceRequestForm kind={s.form} preselect={s.serviceType} />
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="py-24">
        <div className="container-x max-w-4xl">
          <SectionHeading
            eyebrow="FAQ"
            title={
              <>
                Common <span className="text-gold-grad">Questions</span>
              </>
            }
          />
          <div className="mt-12 space-y-3">
            {s.faqs.map((f) => (
              <details key={f.q} className="card group p-0 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold text-text">
                  {f.q}
                  <ChevronDown className="size-5 shrink-0 text-gold-ink transition group-open:rotate-180" />
                </summary>
                <p className="px-6 pb-5 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Related ───────── */}
      <section className="container-x">
        <h2 className="text-chrome font-display text-2xl uppercase sm:text-3xl">More Services</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <ServiceCard key={r.slug} slug={r.slug} />
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: s.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.name,
          description: s.metaDescription,
          areaServed: "Derry, NH",
          provider: { "@id": `${base}/#dealer` },
          url: `${base}${serviceHref(s)}`,
        }}
      />
    </>
  );
}
