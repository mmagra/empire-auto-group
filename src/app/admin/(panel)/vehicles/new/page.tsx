import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin/ui";
import { VehicleForm } from "@/components/admin/VehicleForm";

export const metadata = { title: "Add Vehicle" };

export default function NewVehiclePage() {
  return (
    <>
      <Link href="/admin/vehicles" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-gold-ink">
        <ArrowLeft className="size-4" /> All vehicles
      </Link>
      <AdminHeader title="Add Vehicle" subtitle="Work through the 5 steps below, then press Create Vehicle. Only the fields marked * are required." />
      <VehicleForm
        initial={{
          status: "AVAILABLE",
          featured: false,
          vin: "",
          stockNumber: "",
          year: "",
          make: "",
          model: "",
          trim: "",
          bodyType: "",
          price: "",
          salePrice: "",
          mileage: "",
          exteriorColor: "",
          interiorColor: "",
          transmission: "",
          drivetrain: "",
          fuelType: "",
          engine: "",
          description: "",
          features: [],
        }}
      />
    </>
  );
}
