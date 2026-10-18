import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus, Search, Star } from "lucide-react";
import { db } from "@/lib/db";
import { VEHICLE_STATUSES, STATUS_LABEL } from "@/lib/constants";
import { formatDate, formatMiles, formatPrice, vehicleTitle } from "@/lib/format";
import { photoUrl } from "@/lib/uploads";
import { AdminHeader } from "@/components/admin/ui";
import { VehicleRowActions } from "@/components/admin/VehicleRowActions";
import { CarPlaceholder } from "@/components/site/CarPlaceholder";

export const metadata = { title: "Vehicles" };

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const status = VEHICLE_STATUSES.includes(sp.status as never) ? sp.status : undefined;
  const q = sp.q?.trim().slice(0, 60);

  const where: Prisma.VehicleWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { make: { contains: q } },
            { model: { contains: q } },
            { trim: { contains: q } },
            { vin: { contains: q.toUpperCase() } },
            { stockNumber: { contains: q } },
            ...(/^\d{4}$/.test(q) ? [{ year: Number(q) }] : []),
          ],
        }
      : {}),
  };

  const [vehicles, counts] = await Promise.all([
    db.vehicle.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 }, _count: { select: { photos: true, leads: true } } },
    }),
    db.vehicle.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (s?: string) => (s ? (counts.find((c) => c.status === s)?._count ?? 0) : counts.reduce((n, c) => n + c._count, 0));

  const tabHref = (s?: string) => {
    const p = new URLSearchParams();
    if (s) p.set("status", s);
    if (q) p.set("q", q);
    return `/admin/vehicles${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <AdminHeader
        title="Vehicles"
        subtitle="Add, edit and manage the cars listed on your website."
        actions={
          <Link href="/admin/vehicles/new" className="btn btn-gold btn-sm">
            <Plus className="size-4" /> Add Vehicle
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg border border-line bg-ink p-1">
          {[undefined, ...VEHICLE_STATUSES].map((s) => (
            <Link
              key={s ?? "all"}
              href={tabHref(s)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                status === s ? "bg-gold text-black" : "text-muted hover:text-text"
              }`}
            >
              {s ? STATUS_LABEL[s] : "All"} <span className="opacity-60">{countFor(s)}</span>
            </Link>
          ))}
        </div>
        <form className="relative w-full lg:w-80">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <input name="q" defaultValue={q} placeholder="Search make, model, VIN, stock #" className="input py-2 pl-9 text-sm" />
        </form>
      </div>

      {vehicles.length ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-subtle">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vehicle</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Miles</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-2/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/vehicles/${v.id}`} className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
                          {v.photos[0] ? (
                            <Image src={photoUrl(v.photos[0].filename, "sm")} alt="" fill sizes="64px" className="object-cover" unoptimized />
                          ) : (
                            <CarPlaceholder label="" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-medium text-text hover:text-gold-ink">
                            {v.featured && <Star className="size-3.5 fill-gold text-gold-ink" aria-label="Featured" />}
                            {vehicleTitle(v)}
                          </p>
                          <p className="text-xs text-subtle">
                            {v.stockNumber ? `#${v.stockNumber} · ` : ""}
                            {v._count.photos} photo{v._count.photos === 1 ? "" : "s"}
                            {v._count.leads ? ` · ${v._count.leads} lead${v._count.leads === 1 ? "" : "s"}` : ""}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {v.salePrice != null ? (
                        <>
                          <span className="text-gold-ink">{formatPrice(v.salePrice)}</span>
                          <span className="ml-1 text-xs text-subtle line-through">{formatPrice(v.price)}</span>
                        </>
                      ) : (
                        formatPrice(v.price)
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatMiles(v.mileage)}</td>
                    <td className="px-4 py-3">
                      <VehicleRowActions id={v.id} status={v.status} featured={v.featured} slug={v.slug} mode="status" />
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(v.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <VehicleRowActions id={v.id} status={v.status} featured={v.featured} slug={v.slug} mode="menu" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-muted">{q || status ? "No vehicles match." : "No vehicles yet."}</p>
          <Link href="/admin/vehicles/new" className="btn btn-gold btn-sm mt-4">
            <Plus className="size-4" /> Add Vehicle
          </Link>
        </div>
      )}
    </>
  );
}
