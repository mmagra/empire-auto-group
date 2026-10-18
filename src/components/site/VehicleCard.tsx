import Link from "next/link";
import { Cog, Fuel, Gauge, Zap } from "lucide-react";
import { formatMiles, formatPrice, vehicleTitle } from "@/lib/format";
import { photoUrl } from "@/lib/uploads";
import type { VehicleWithPhotos } from "@/lib/vehicles";
import { CardPhotos } from "./CardPhotos";

export function VehicleCard({ v, priority = false }: { v: VehicleWithPhotos; priority?: boolean }) {
  const onSale = v.salePrice != null && v.salePrice < v.price;

  return (
    <Link
      href={`/inventory/${v.slug}`}
      className="group card relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_20px_50px_-20px_rgb(245_197_24/0.35)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <CardPhotos photos={v.photos.map((p) => photoUrl(p.filename, "sm"))} title={vehicleTitle(v)} priority={priority} />
        {v.photos.length > 0 && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />}
        <div className="absolute left-3 top-3 flex gap-2">
          {v.status === "PENDING" && (
            <span className="dark-zone rounded-full bg-black/80 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-gold-ink ring-1 ring-gold/50">
              Sale Pending
            </span>
          )}
          {onSale && v.status !== "PENDING" && (
            <span className="rounded-full bg-gold px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-black">Price Drop</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{v.year}</p>
        <h3 className="mt-1 font-display text-lg uppercase leading-tight text-text transition-colors group-hover:text-gold-ink">
          {v.make} {v.model}
        </h3>
        {v.trim && <p className="mt-0.5 text-sm text-muted">{v.trim}</p>}

        <div className="mb-5 mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-text/75">
          <span className="flex items-center gap-1.5">
            <Gauge className="size-3.5 text-gold-ink" /> {formatMiles(v.mileage)}
          </span>
          {v.transmission && (
            <span className="flex items-center gap-1.5">
              <Cog className="size-3.5 text-gold-ink" /> {v.transmission}
            </span>
          )}
          {v.drivetrain && (
            <span className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-gold-ink" /> {v.drivetrain}
            </span>
          )}
          {v.fuelType && (
            <span className="flex items-center gap-1.5">
              <Fuel className="size-3.5 text-gold-ink" /> {v.fuelType}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            {onSale && <p className="text-xs text-subtle line-through">{formatPrice(v.price)}</p>}
            <p className="text-gold-grad font-display text-2xl">{formatPrice(onSale ? v.salePrice! : v.price)}</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted transition-colors group-hover:text-gold-ink">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
