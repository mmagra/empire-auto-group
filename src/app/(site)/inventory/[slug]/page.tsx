import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, CarFront, Check, Cog, Fuel, Gauge, MessageSquare, Palette, Phone, Settings2, Zap } from "lucide-react";
import { site } from "@/config/site";
import { formatMiles, formatNumber, formatPrice, vehicleTitle } from "@/lib/format";
import { siteUrl } from "@/lib/site-url";
import { photoUrl } from "@/lib/uploads";
import { getPublicVehicle, similarVehicles, vehicleFeatures } from "@/lib/vehicles";
import { serviceBySlug, serviceHref } from "@/content/services";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Gallery } from "@/components/site/Gallery";
import { JsonLd } from "@/components/site/JsonLd";
import { VehicleCard } from "@/components/site/VehicleCard";
import { VehicleInquiry } from "@/components/site/VehicleInquiry";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await getPublicVehicle((await params).slug);
  if (!v) return { title: "Vehicle not found" };
  const title = vehicleTitle(v);
  const price = v.salePrice ?? v.price;
  const description = `${title} for sale in Derry, NH: ${formatPrice(price)}, ${formatMiles(v.mileage)}${v.exteriorColor ? `, ${v.exteriorColor}` : ""}. Help with financing paperwork and trade-ins at ${site.name}.`;
  const cover = v.photos[0] ? photoUrl(v.photos[0].filename, "lg") : "/brand/og-default.jpg";
  return {
    title: `${title} for Sale`,
    description,
    alternates: { canonical: `/inventory/${v.slug}` },
    openGraph: { title: `${title} | ${formatPrice(price)}`, description, images: [{ url: cover }] },
  };
}

export default async function VehiclePage({ params }: Props) {
  const v = await getPublicVehicle((await params).slug);
  if (!v) notFound();

  const title = vehicleTitle(v);
  const features = vehicleFeatures(v);
  const onSale = v.salePrice != null && v.salePrice < v.price;
  const price = onSale ? v.salePrice! : v.price;
  const similar = await similarVehicles(v);
  const base = await siteUrl();
  const photos = v.photos.map((p) => ({ lg: photoUrl(p.filename, "lg"), sm: photoUrl(p.filename, "sm") }));

  const specs: [string, string | null | undefined][] = [
    ["Year", String(v.year)],
    ["Make", v.make],
    ["Model", v.model],
    ["Trim", v.trim],
    ["Body Style", v.bodyType],
    ["Mileage", `${formatNumber(v.mileage)} miles`],
    ["Exterior", v.exteriorColor],
    ["Interior", v.interiorColor],
    ["Transmission", v.transmission],
    ["Drivetrain", v.drivetrain],
    ["Engine", v.engine],
    ["Fuel", v.fuelType],
    ["Stock #", v.stockNumber],
    ["VIN", v.vin],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    brand: { "@type": "Brand", name: v.make },
    model: v.model,
    vehicleModelDate: String(v.year),
    ...(v.vin ? { vehicleIdentificationNumber: v.vin } : {}),
    ...(v.bodyType ? { bodyType: v.bodyType } : {}),
    ...(v.exteriorColor ? { color: v.exteriorColor } : {}),
    ...(v.transmission ? { vehicleTransmission: v.transmission } : {}),
    ...(v.drivetrain ? { driveWheelConfiguration: v.drivetrain } : {}),
    ...(v.fuelType ? { fuelType: v.fuelType } : {}),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileage, unitCode: "SMI" },
    itemCondition: "https://schema.org/UsedCondition",
    image: photos.map((p) => `${base}${p.lg}`),
    url: `${base}/inventory/${v.slug}`,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "USD",
      availability: v.status === "AVAILABLE" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
      seller: { "@id": `${base}/#dealer` },
    },
  };

  const keySpecs = [
    { icon: Gauge, label: "Mileage", value: `${formatNumber(v.mileage)} mi` },
    { icon: CalendarDays, label: "Year", value: String(v.year) },
    { icon: Cog, label: "Transmission", value: v.transmission },
    { icon: Zap, label: "Drivetrain", value: v.drivetrain },
    { icon: Fuel, label: "Fuel", value: v.fuelType },
    { icon: Settings2, label: "Engine", value: v.engine },
    { icon: Palette, label: "Exterior", value: v.exteriorColor },
    { icon: CarFront, label: "Body Style", value: v.bodyType },
  ].filter((k) => k.value);
  const details = specs.filter(([, val]) => val);

  return (
    <>
      <div className="container-x pb-8 pt-[calc(var(--header-h)+1.5rem)]">
        <Breadcrumbs baseUrl={base} items={[{ label: "Inventory", href: "/inventory" }, { label: title }]} />

        {/* Phones: one column ordered gallery → summary → details → forms.
            Desktop: two columns, the summary card heads the right column. */}
        <div className="mt-6 flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-10">
          {/* ───────── Left ───────── */}
          <div className="contents min-w-0 lg:block lg:space-y-12">
            <div className="order-1">
              <Gallery photos={photos} title={title} />
            </div>

            <div className="order-3 space-y-12">

            {/* Key specs as tiles */}
            <section>
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold-ink">At A Glance</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {keySpecs.map((k) => (
                  <div key={k.label} className="rounded-2xl border border-line bg-surface p-4">
                    <k.icon className="size-5 text-gold-ink" />
                    <p className="mt-3 text-xs uppercase tracking-wider text-subtle">{k.label}</p>
                    <p className="mt-0.5 truncate font-semibold text-text" title={k.value ?? undefined}>
                      {k.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Full details: two columns, a leftover last item spans both so there's never an empty cell */}
            <section>
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold-ink">Vehicle Details</h2>
              <dl className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
                {details.map(([k, val], i) => (
                  <div
                    key={k}
                    className={`flex items-center justify-between gap-4 bg-surface px-5 py-3.5 text-sm ${
                      details.length % 2 === 1 && i === details.length - 1 ? "sm:col-span-2" : ""
                    }`}
                  >
                    <dt className="text-muted">{k}</dt>
                    <dd className={`text-right font-medium text-text ${k === "VIN" ? "font-mono text-xs tracking-wider" : ""}`}>{val}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {features.length > 0 && (
              <section>
                <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold-ink">Features</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-text/90">
                      <Check className="size-4 text-gold-ink" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {v.description && (
              <section>
                <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold-ink">About This Vehicle</h2>
                <div className="mt-4 whitespace-pre-line rounded-2xl border border-line bg-surface p-6 leading-relaxed text-text/85">{v.description}</div>
              </section>
            )}
            </div>
          </div>

          {/* ───────── Right ───────── */}
          <aside className="contents lg:block lg:space-y-6">
            {/* Summary: title, price and quick actions */}
            <div className="card relative order-2 overflow-hidden p-6">
              <div className="gold-rule absolute inset-x-6 top-0" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-surface-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted">Pre-Owned</span>
                {v.status === "PENDING" && (
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-ink ring-1 ring-gold/40">Sale Pending</span>
                )}
                {onSale && <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">Price Drop</span>}
              </div>
              {v.stockNumber && <p className="mt-3 text-xs text-subtle">Stock #{v.stockNumber}</p>}
              <h1 className="text-chrome mt-1 font-display text-3xl uppercase leading-tight">
                {v.year} {v.make} {v.model}
              </h1>
              {v.trim && <p className="mt-1 text-muted">{v.trim}</p>}

              <div className="mt-5 border-t border-line pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Our Price</p>
                {onSale && <p className="mt-1 text-sm text-subtle line-through">{formatPrice(v.price)}</p>}
                <p className="text-gold-grad font-display text-5xl">{formatPrice(price)}</p>
                <p className="mt-1 text-sm text-muted">{formatMiles(v.mileage)} · Plus tax, title & fees</p>
              </div>

              <div className="mt-6 grid gap-3">
                <a href={site.phoneHref} className="btn btn-gold">
                  <Phone className="size-4" /> Call {site.phone}
                </a>
                <a href="#inquire" className="btn btn-ghost">
                  <MessageSquare className="size-4" /> Ask About It
                </a>
              </div>
              <ul className="mt-6 space-y-2 border-t border-line pt-5 text-sm text-muted">
                {["Help with financing paperwork", "Trade-ins welcome", "Service & detailing on site"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="size-4 text-gold-ink" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-4 space-y-6">
            <VehicleInquiry vehicleId={v.id} title={title} />
            <div className="card divide-y divide-line">
              {(["oil-change", "detailing", "general-repair"] as const).map((slug) => {
                const svc = serviceBySlug(slug)!;
                return (
                  <Link key={slug} href={serviceHref(svc)} className="group flex items-center gap-4 p-4 transition hover:bg-surface-2">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-ink">
                      <svc.icon className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-text">{svc.name}</span>
                      <span className="block text-xs text-muted">{svc.short}</span>
                    </span>
                    <ArrowRight className="size-4 text-subtle transition group-hover:translate-x-1 group-hover:text-gold-ink" />
                  </Link>
                );
              })}
            </div>
            </div>
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="container-x py-16">
          <h2 className="text-chrome font-display text-2xl uppercase sm:text-3xl">You May Also Like</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <VehicleCard key={s.id} v={s} />
            ))}
          </div>
        </section>
      )}

      <JsonLd data={jsonLd} />
    </>
  );
}
