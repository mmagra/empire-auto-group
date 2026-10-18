import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

type VpicResult = Record<string, string | null>;

const pick = (r: VpicResult, key: string) => {
  const v = r[key]?.trim();
  return v && v !== "Not Applicable" ? v : "";
};

function mapBody(cls: string) {
  const c = cls.toLowerCase();
  if (c.includes("pickup")) return "Truck";
  if (c.includes("sport utility") || c.includes("suv") || c.includes("crossover")) return "SUV";
  if (c.includes("minivan")) return "Minivan";
  if (c.includes("van")) return "Van";
  if (c.includes("coupe")) return "Coupe";
  if (c.includes("convertible") || c.includes("cabriolet")) return "Convertible";
  if (c.includes("hatchback")) return "Hatchback";
  if (c.includes("wagon")) return "Wagon";
  if (c.includes("sedan")) return "Sedan";
  return "";
}

function mapDrive(d: string) {
  const s = d.toLowerCase();
  if (s.includes("4x4") || s.includes("4wd") || s.includes("four")) return "4WD";
  if (s.includes("awd") || s.includes("all")) return "AWD";
  if (s.includes("rwd") || s.includes("rear")) return "RWD";
  if (s.includes("fwd") || s.includes("front")) return "FWD";
  return "";
}

function mapFuel(f: string, electrification: string) {
  const s = `${f} ${electrification}`.toLowerCase();
  if (s.includes("plug-in") || s.includes("phev")) return "Plug-in Hybrid";
  if (s.includes("hybrid") || s.includes("hev")) return "Hybrid";
  if (s.includes("electric") && !s.includes("gasoline")) return "Electric";
  if (s.includes("diesel")) return "Diesel";
  if (s.includes("flex")) return "Flex Fuel";
  if (s.includes("gasoline")) return "Gasoline";
  return "";
}

const titleCase = (s: string) => (s === s.toUpperCase() && s.length > 3 ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : s);

/** Decodes a VIN with the free NHTSA vPIC API. Admin only. */
export async function GET(_req: Request, { params }: { params: Promise<{ vin: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vin = (await params).vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
  if (vin.length !== 17) return NextResponse.json({ error: "A VIN is 17 characters (no I, O or Q)." }, { status: 400 });

  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`vPIC ${res.status}`);
    const r: VpicResult = (await res.json()).Results?.[0] ?? {};
    if (!pick(r, "Make")) return NextResponse.json({ error: "Couldn't decode that VIN. Check it and try again." }, { status: 404 });

    const cyl = pick(r, "EngineCylinders");
    const disp = pick(r, "DisplacementL");
    const engine = [disp && `${Number(disp).toFixed(1)}L`, cyl && `${cyl}-Cyl`, pick(r, "Turbo") === "Yes" ? "Turbo" : ""].filter(Boolean).join(" ");
    const trans = pick(r, "TransmissionStyle").toLowerCase();

    return NextResponse.json({
      vin,
      year: Number(pick(r, "ModelYear")) || null,
      make: titleCase(pick(r, "Make")),
      model: pick(r, "Model"),
      trim: [pick(r, "Trim"), pick(r, "Series")].filter(Boolean).join(" ").trim(),
      bodyType: mapBody(pick(r, "BodyClass")),
      drivetrain: mapDrive(pick(r, "DriveType")),
      fuelType: mapFuel(pick(r, "FuelTypePrimary"), pick(r, "ElectrificationLevel")),
      engine,
      transmission: trans.includes("manual") ? "Manual" : trans.includes("cvt") || trans.includes("continuously") ? "CVT" : trans ? "Automatic" : "",
    });
  } catch {
    return NextResponse.json({ error: "The VIN lookup service is unavailable right now. Enter details manually." }, { status: 502 });
  }
}
