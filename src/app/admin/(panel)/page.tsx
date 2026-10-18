import Link from "next/link";
import Image from "next/image";
import { CarFront, CircleDollarSign, Clock, Inbox, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatDateTime, formatPrice, vehicleTitle } from "@/lib/format";
import { photoUrl } from "@/lib/uploads";
import { AdminHeader, LeadStatusBadge, LeadTypeBadge, StatCard, StatusBadge } from "@/components/admin/ui";
import { CarPlaceholder } from "@/components/site/CarPlaceholder";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [available, pending, soldThisMonth, newLeads, inventoryValue, leads, recent] = await Promise.all([
    db.vehicle.count({ where: { status: "AVAILABLE" } }),
    db.vehicle.count({ where: { status: "PENDING" } }),
    db.vehicle.count({ where: { status: "SOLD", soldAt: { gte: monthStart } } }),
    db.lead.count({ where: { status: "NEW" } }),
    db.vehicle.aggregate({ where: { status: { in: ["AVAILABLE", "PENDING"] } }, _sum: { price: true } }),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { vehicle: { select: { year: true, make: true, model: true, trim: true } } } }),
    db.vehicle.findMany({ orderBy: { updatedAt: "desc" }, take: 5, include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } } }),
  ]);

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="Here's what's happening at Empire Auto Group."
        actions={
          <Link href="/admin/vehicles/new" className="btn btn-gold btn-sm">
            <Plus className="size-4" /> Add Vehicle
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available" value={available} hint={`${pending} sale pending`} icon={<CarFront className="size-5" />} />
        <StatCard label="Sold this month" value={soldThisMonth} icon={<Clock className="size-5" />} />
        <StatCard label="New leads" value={newLeads} hint="Waiting for a reply" icon={<Inbox className="size-5" />} />
        <StatCard label="Inventory value" value={formatPrice(inventoryValue._sum.price ?? 0)} hint="Listed prices" icon={<CircleDollarSign className="size-5" />} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-sm uppercase tracking-[0.15em] text-gold-ink">Latest Leads</h2>
            <Link href="/admin/leads" className="text-sm text-muted hover:text-gold-ink">
              View all →
            </Link>
          </div>
          {leads.length ? (
            <ul className="divide-y divide-line">
              {leads.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads?id=${l.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-surface-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text">{l.name}</p>
                      <p className="truncate text-xs text-muted">
                        {l.vehicle ? vehicleTitle(l.vehicle) : l.phone || l.email} · {formatDateTime(l.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <LeadTypeBadge type={l.type} />
                      <LeadStatusBadge status={l.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted">No leads yet. Form submissions from the website will show up here.</p>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-sm uppercase tracking-[0.15em] text-gold-ink">Recently Updated</h2>
            <Link href="/admin/vehicles" className="text-sm text-muted hover:text-gold-ink">
              All vehicles →
            </Link>
          </div>
          {recent.length ? (
            <ul className="divide-y divide-line">
              {recent.map((v) => (
                <li key={v.id}>
                  <Link href={`/admin/vehicles/${v.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-2">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
                      {v.photos[0] ? (
                        <Image src={photoUrl(v.photos[0].filename, "sm")} alt="" fill sizes="64px" className="object-cover" unoptimized />
                      ) : (
                        <CarPlaceholder label="" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text">{vehicleTitle(v)}</p>
                      <p className="text-xs text-muted">{formatPrice(v.salePrice ?? v.price)}</p>
                    </div>
                    <StatusBadge status={v.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted">No vehicles yet.</p>
              <Link href="/admin/vehicles/new" className="btn btn-gold btn-sm mt-4">
                <Plus className="size-4" /> Add your first vehicle
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
