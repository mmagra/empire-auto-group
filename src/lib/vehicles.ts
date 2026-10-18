import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { PUBLIC_STATUSES, SORTS, type SortKey } from "./constants";
import { parseJson } from "./format";
import { photoUrl } from "./uploads";

export const vehicleWithPhotos = {
  photos: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.VehicleInclude;

export type VehicleWithPhotos = Prisma.VehicleGetPayload<{ include: typeof vehicleWithPhotos }>;

export type InventoryFilters = {
  q?: string;
  make?: string;
  model?: string;
  body?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  maxMiles?: number;
  sort: SortKey;
};

const int = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
};
const str = (v: string | string[] | undefined) => {
  const s = (Array.isArray(v) ? v[0] : v)?.trim();
  return s ? s.slice(0, 60) : undefined;
};

export function parseFilters(sp: Record<string, string | string[] | undefined>): InventoryFilters {
  const sort = str(sp.sort);
  return {
    q: str(sp.q),
    make: str(sp.make),
    model: str(sp.model),
    body: str(sp.body),
    minYear: int(sp.minYear),
    maxYear: int(sp.maxYear),
    minPrice: int(sp.minPrice),
    maxPrice: int(sp.maxPrice),
    maxMiles: int(sp.maxMiles),
    sort: sort && sort in SORTS ? (sort as SortKey) : "newest",
  };
}

const ORDER: Record<SortKey, Prisma.VehicleOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }],
  "price-asc": [{ price: "asc" }],
  "price-desc": [{ price: "desc" }],
  "mileage-asc": [{ mileage: "asc" }],
  "year-desc": [{ year: "desc" }, { createdAt: "desc" }],
};

export async function searchInventory(f: InventoryFilters) {
  const and: Prisma.VehicleWhereInput[] = [{ status: { in: PUBLIC_STATUSES } }];
  if (f.make) and.push({ make: f.make });
  if (f.model) and.push({ model: f.model });
  if (f.body) and.push({ bodyType: f.body });
  if (f.minYear) and.push({ year: { gte: f.minYear } });
  if (f.maxYear) and.push({ year: { lte: f.maxYear } });
  if (f.minPrice) and.push({ price: { gte: f.minPrice } });
  if (f.maxPrice) and.push({ price: { lte: f.maxPrice } });
  if (f.maxMiles) and.push({ mileage: { lte: f.maxMiles } });
  if (f.q) {
    for (const word of f.q.split(/\s+/).slice(0, 5)) {
      const n = Number(word);
      and.push({
        OR: [
          { make: { contains: word } },
          { model: { contains: word } },
          { trim: { contains: word } },
          { bodyType: { contains: word } },
          { exteriorColor: { contains: word } },
          { stockNumber: { contains: word } },
          ...(Number.isInteger(n) && n > 1900 && n < 2100 ? [{ year: n }] : []),
        ],
      });
    }
  }
  return db.vehicle.findMany({ where: { AND: and }, include: vehicleWithPhotos, orderBy: ORDER[f.sort] });
}

/** Distinct makes/models/bodies/years among public vehicles, for filter dropdowns. */
export async function inventoryFacets() {
  const rows = await db.vehicle.findMany({
    where: { status: { in: PUBLIC_STATUSES } },
    select: { make: true, model: true, bodyType: true, year: true },
  });
  const makes = [...new Set(rows.map((r) => r.make))].sort();
  const modelsByMake: Record<string, string[]> = {};
  for (const r of rows) {
    const list = (modelsByMake[r.make] ??= []);
    if (!list.includes(r.model)) list.push(r.model);
  }
  Object.values(modelsByMake).forEach((m) => m.sort());
  const bodies = [...new Set(rows.map((r) => r.bodyType).filter(Boolean) as string[])].sort();
  const years = rows.map((r) => r.year);
  return {
    makes,
    modelsByMake,
    bodies,
    minYear: years.length ? Math.min(...years) : undefined,
    maxYear: years.length ? Math.max(...years) : undefined,
  };
}

/** Number of public vehicles per body style, for "shop by body style". */
export async function bodyStyleCounts() {
  const rows = await db.vehicle.groupBy({ by: ["bodyType"], where: { status: { in: PUBLIC_STATUSES } }, _count: true });
  return Object.fromEntries(rows.filter((r) => r.bodyType).map((r) => [r.bodyType as string, r._count])) as Record<string, number>;
}

export async function featuredVehicles(limit = 8) {
  const featured = await db.vehicle.findMany({
    where: { status: { in: PUBLIC_STATUSES }, featured: true },
    include: vehicleWithPhotos,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  if (featured.length >= 3) return featured;
  // Top up with the newest listings so the home page never looks empty.
  const more = await db.vehicle.findMany({
    where: { status: { in: PUBLIC_STATUSES }, id: { notIn: featured.map((v) => v.id) } },
    include: vehicleWithPhotos,
    orderBy: { createdAt: "desc" },
    take: limit - featured.length,
  });
  return [...featured, ...more];
}

export async function getPublicVehicle(slug: string) {
  return db.vehicle.findFirst({ where: { slug, status: { in: PUBLIC_STATUSES } }, include: vehicleWithPhotos });
}

export async function similarVehicles(v: { id: string; make: string; bodyType: string | null; price: number }, limit = 4) {
  return db.vehicle.findMany({
    where: {
      id: { not: v.id },
      status: { in: PUBLIC_STATUSES },
      OR: [{ make: v.make }, ...(v.bodyType ? [{ bodyType: v.bodyType }] : []), { price: { gte: v.price * 0.75, lte: v.price * 1.25 } }],
    },
    include: vehicleWithPhotos,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function coverPhoto(v: VehicleWithPhotos, size: "lg" | "sm" = "sm") {
  const p = v.photos[0];
  return p ? photoUrl(p.filename, size) : null;
}

export function vehicleFeatures(v: { features: string }) {
  return parseJson<string[]>(v.features, []);
}
