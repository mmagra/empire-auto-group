import type { Metadata } from "next";
import { Suspense } from "react";
import { Phone } from "lucide-react";
import { site } from "@/config/site";
import { inventoryFacets, parseFilters, searchInventory } from "@/lib/vehicles";
import { InventoryFilters } from "@/components/site/InventoryFilters";
import { PageHero } from "@/components/site/PageHero";
import { VehicleCard } from "@/components/site/VehicleCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Used Cars for Sale in Derry, NH",
  description: "Shop quality pre-owned cars, trucks and SUVs for sale at Empire Auto Group in Derry, NH. Help with financing paperwork and trade-ins welcome.",
  alternates: { canonical: "/inventory" },
};

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseFilters(await searchParams);
  const [vehicles, facets] = await Promise.all([searchInventory(filters), inventoryFacets()]);

  return (
    <>
      <PageHero
        eyebrow="Our Inventory"
        title={
          <>
            Find Your Next <span className="text-gold-grad">Ride</span>
          </>
        }
        intro="Quality pre-owned vehicles, inspected and priced right. Help with financing paperwork and trade-ins welcome on every car."
      />

      <section className="container-x py-12">
        <Suspense>
          <InventoryFilters facets={facets} total={vehicles.length}>
            {vehicles.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((v, i) => (
                  <VehicleCard key={v.id} v={v} priority={i < 3} />
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="font-display text-xl uppercase text-text">No vehicles match those filters</p>
                <p className="mx-auto mt-3 max-w-md text-muted">
                  Try widening your search, or tell us what you&apos;re looking for and we&apos;ll keep an eye out for it.
                </p>
                <a href={site.phoneHref} className="btn btn-gold mt-6">
                  <Phone className="size-4" /> {site.phone}
                </a>
              </div>
            )}
          </InventoryFilters>
        </Suspense>
      </section>
    </>
  );
}
