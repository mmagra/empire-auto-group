import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { parseJson, vehicleTitle } from "@/lib/format";
import { photoUrl } from "@/lib/uploads";
import { AdminHeader, StatusBadge } from "@/components/admin/ui";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { VehicleRowActions } from "@/components/admin/VehicleRowActions";

export const metadata = { title: "Edit Vehicle" };

export default async function EditVehiclePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; failed?: string }> }) {
  const { id } = await params;
  const { created, failed } = await searchParams;
  const v = await db.vehicle.findUnique({ where: { id }, include: { photos: { orderBy: { sortOrder: "asc" } } } });
  if (!v) notFound();

  const s = (x: string | number | null) => (x == null ? "" : String(x));
  const isPublic = v.status === "AVAILABLE" || v.status === "PENDING";

  return (
    <>
      <Link href="/admin/vehicles" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-gold-ink">
        <ArrowLeft className="size-4" /> All vehicles
      </Link>
      <AdminHeader
        title={vehicleTitle(v)}
        subtitle={<StatusBadge status={v.status} />}
        actions={
          <>
            {isPublic && (
              <a href={`/inventory/${v.slug}`} target="_blank" className="btn btn-ghost btn-sm">
                <ExternalLink className="size-4" /> View on site
              </a>
            )}
            <VehicleRowActions id={v.id} status={v.status} featured={v.featured} slug={v.slug} mode="detail" />
          </>
        }
      />

      {created && (
        <p className="mb-6 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="size-4" /> Vehicle created
          {v.photos.length ? ` with ${v.photos.length} photo${v.photos.length === 1 ? "" : "s"}.` : ". Add some photos in step 1 so shoppers can see it."}
          {failed && <span className="text-danger"> {failed} photo(s) couldn&apos;t be read. Try JPG or PNG.</span>}
        </p>
      )}

      <VehicleForm
        photos={v.photos.map((p) => ({ id: p.id, url: photoUrl(p.filename, "sm") }))}
          initial={{
            id: v.id,
            status: v.status,
            featured: v.featured,
            vin: s(v.vin),
            stockNumber: s(v.stockNumber),
            year: s(v.year),
            make: v.make,
            model: v.model,
            trim: s(v.trim),
            bodyType: s(v.bodyType),
            price: s(v.price),
            salePrice: s(v.salePrice),
            mileage: s(v.mileage),
            exteriorColor: s(v.exteriorColor),
            interiorColor: s(v.interiorColor),
            transmission: s(v.transmission),
            drivetrain: s(v.drivetrain),
            fuelType: s(v.fuelType),
            engine: s(v.engine),
            description: s(v.description),
            features: parseJson<string[]>(v.features, []),
          }}
        />
    </>
  );
}
