import "server-only";
import path from "node:path";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { UPLOAD_DIR } from "./paths";

export { UPLOAD_DIR };
const VEHICLE_DIR = path.join(UPLOAD_DIR, "vehicles");

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const SIZES = { lg: 1600, sm: 640 } as const;

/** Public URL for a stored vehicle photo. */
export function photoUrl(filename: string, size: keyof typeof SIZES = "lg") {
  return `/media/vehicles/${filename}-${size}.webp`;
}

/**
 * Resizes an uploaded image to large + small WebP files and returns the base
 * filename and the large image's dimensions. Rejects anything sharp can't read.
 */
export async function saveVehiclePhoto(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name} is larger than 15 MB.`);
  const input = Buffer.from(await file.arrayBuffer());
  await mkdir(VEHICLE_DIR, { recursive: true });

  const base = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}`;
  const pipeline = sharp(input, { failOn: "error" }).rotate(); // respect EXIF orientation

  const lg = await pipeline
    .clone()
    .resize({ width: SIZES.lg, height: SIZES.lg, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const sm = await pipeline
    .clone()
    .resize({ width: SIZES.sm, height: Math.round(SIZES.sm * 0.75), fit: "cover", position: "attention" })
    .webp({ quality: 78 })
    .toBuffer();

  await writeFile(path.join(VEHICLE_DIR, `${base}-lg.webp`), lg.data);
  await writeFile(path.join(VEHICLE_DIR, `${base}-sm.webp`), sm);
  return { filename: base, width: lg.info.width, height: lg.info.height };
}

export async function deleteVehiclePhotoFiles(filename: string) {
  for (const size of Object.keys(SIZES)) {
    await unlink(path.join(VEHICLE_DIR, `${filename}-${size}.webp`)).catch(() => {});
  }
}
