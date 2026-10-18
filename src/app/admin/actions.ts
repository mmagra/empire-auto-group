"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, hashPassword, needsFirstAdmin, requireAdmin, verifyPassword } from "@/lib/auth";
import { LEAD_STATUSES, VEHICLE_STATUSES } from "@/lib/constants";
import { slugify } from "@/lib/format";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendTestEmail } from "@/lib/mail";
import { getMailSettings, setSetting } from "@/lib/settings";
import { deleteVehiclePhotoFiles, saveVehiclePhoto } from "@/lib/uploads";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string>; id?: string } | null;

const fieldErrors = (error: z.ZodError) => {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) errors[String(issue.path[0])] ??= issue.message;
  return errors;
};

function revalidatePublic(slug?: string) {
  revalidatePath("/");
  revalidatePath("/inventory");
  if (slug) revalidatePath(`/inventory/${slug}`);
  revalidatePath("/sitemap.xml");
}

/* ───────────────────────── Auth ───────────────────────── */

let dummy: Promise<string> | undefined;
const dummyHash = () => (dummy ??= hashPassword(crypto.randomUUID()));

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!rateLimit(`login:${await clientIp()}`, 8, 15 * 60 * 1000)) {
    return { ok: false, message: "Too many attempts. Wait 15 minutes and try again." };
  }
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const user = email ? await db.adminUser.findUnique({ where: { email } }) : null;
  // Always run bcrypt so response time doesn't reveal whether the email exists.
  const valid = await verifyPassword(password, user?.passwordHash ?? (await dummyHash()));
  if (!user || !valid) return { ok: false, message: "Incorrect email or password." };

  await createSession({ uid: user.id, email: user.email, name: user.name });
  const next = String(formData.get("next") || "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

/** First-run screen: creates the very first admin. Refuses once any admin exists. */
export async function setupFirstAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await needsFirstAdmin())) return { ok: false, message: "Setup is already complete. Please sign in." };
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Name is required.").max(80),
      email: z.string().trim().toLowerCase().email("Enter a valid email."),
      password: z.string().min(10, "Use at least 10 characters.").max(200),
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, { message: "Passwords don't match.", path: ["confirm"] })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };

  const { name, email, password } = parsed.data;
  const user = await db.$transaction(async (tx) => {
    if ((await tx.adminUser.count()) > 0) return null;
    return tx.adminUser.create({ data: { name, email, passwordHash: await hashPassword(password) } });
  });
  if (!user) return { ok: false, message: "Setup is already complete. Please sign in." };
  await createSession({ uid: user.id, email: user.email, name: user.name });
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ───────────────────────── Vehicles ───────────────────────── */

const optionalText = z
  .string()
  .trim()
  .max(120)
  .transform((v) => v || null);
const money = (label: string) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(/[$,\s]/g, ""))
    .pipe(z.string().regex(/^\d+$/, `${label} must be a whole number.`))
    .transform(Number);

const vehicleSchema = z.object({
  status: z.enum(VEHICLE_STATUSES),
  featured: z.boolean(),
  vin: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => !v || /^[A-HJ-NPR-Z0-9]{17}$/.test(v), "VIN must be 17 characters (no I, O or Q).")
    .transform((v) => v || null),
  stockNumber: optionalText,
  year: z.coerce.number().int().min(1950, "Enter a valid year.").max(new Date().getFullYear() + 2, "Enter a valid year."),
  make: z.string().trim().min(1, "Make is required.").max(40),
  model: z.string().trim().min(1, "Model is required.").max(60),
  trim: optionalText,
  bodyType: optionalText,
  price: money("Price").pipe(z.number().min(1, "Price is required.")),
  salePrice: z
    .string()
    .trim()
    .transform((v) => v.replace(/[$,\s]/g, ""))
    .refine((v) => !v || /^\d+$/.test(v), "Sale price must be a whole number.")
    .transform((v) => (v ? Number(v) : null)),
  mileage: money("Mileage"),
  exteriorColor: optionalText,
  interiorColor: optionalText,
  transmission: optionalText,
  drivetrain: optionalText,
  fuelType: optionalText,
  engine: optionalText,
  description: z
    .string()
    .trim()
    .max(5000)
    .transform((v) => v || null),
});

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base;
  for (let i = 2; ; i++) {
    const clash = await db.vehicle.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } });
    if (!clash) return slug;
    slug = `${base}-${i}`;
  }
}

export async function saveVehicle(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") || "") || undefined;

  const raw = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const parsed = vehicleSchema.safeParse({ ...raw, featured: formData.get("featured") === "on" });
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  const data = parsed.data;

  if (data.salePrice != null && data.salePrice >= data.price) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: { salePrice: "Sale price should be lower than the price." } };
  }
  if (data.vin) {
    const dup = await db.vehicle.findFirst({ where: { vin: data.vin, ...(id ? { id: { not: id } } : {}) }, select: { id: true } });
    if (dup) return { ok: false, message: "Another vehicle already uses this VIN.", errors: { vin: "Duplicate VIN." } };
  }

  const custom = String(formData.get("customFeatures") || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const features = [...new Set([...formData.getAll("features").map(String), ...custom])].slice(0, 60);

  const slugBase = slugify([data.year, data.make, data.model, data.trim, data.stockNumber || data.vin?.slice(-6)].filter(Boolean).join(" "));
  const existing = id ? await db.vehicle.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, message: "That vehicle no longer exists." };

  const slug = await uniqueSlug(slugBase, id);
  const soldAt = data.status === "SOLD" ? (existing?.soldAt ?? new Date()) : null;
  const payload = { ...data, features: JSON.stringify(features), slug, soldAt };

  const saved = id ? await db.vehicle.update({ where: { id }, data: payload }) : await db.vehicle.create({ data: payload });

  revalidatePublic(saved.slug);
  if (existing && existing.slug !== saved.slug) revalidatePath(`/inventory/${existing.slug}`);
  // New vehicles return their id so the form can upload the chosen photos, then open the edit page.
  if (!id) return { ok: true, message: "Vehicle created.", id: saved.id };
  return { ok: true, message: "Vehicle saved." };
}

export async function setVehicleStatus(id: string, status: string) {
  await requireAdmin();
  const s = z.enum(VEHICLE_STATUSES).parse(status);
  const v = await db.vehicle.update({
    where: { id },
    data: { status: s, soldAt: s === "SOLD" ? new Date() : null },
  });
  revalidatePublic(v.slug);
  revalidatePath("/admin/vehicles");
}

export async function toggleFeatured(id: string) {
  await requireAdmin();
  const v = await db.vehicle.findUniqueOrThrow({ where: { id } });
  await db.vehicle.update({ where: { id }, data: { featured: !v.featured } });
  revalidatePublic(v.slug);
  revalidatePath("/admin/vehicles");
}

export async function duplicateVehicle(id: string) {
  await requireAdmin();
  const v = await db.vehicle.findUniqueOrThrow({ where: { id } });
  // Copy the specs; identity fields (VIN, stock #, photos, dates) start fresh.
  const copy = await db.vehicle.create({
    data: {
      year: v.year,
      make: v.make,
      model: v.model,
      trim: v.trim,
      bodyType: v.bodyType,
      price: v.price,
      salePrice: v.salePrice,
      mileage: v.mileage,
      exteriorColor: v.exteriorColor,
      interiorColor: v.interiorColor,
      transmission: v.transmission,
      drivetrain: v.drivetrain,
      fuelType: v.fuelType,
      engine: v.engine,
      features: v.features,
      description: v.description,
      status: "DRAFT",
      slug: await uniqueSlug(`${v.slug}-copy`),
    },
  });
  redirect(`/admin/vehicles/${copy.id}`);
}

export async function deleteVehicle(id: string) {
  await requireAdmin();
  const v = await db.vehicle.findUnique({ where: { id }, include: { photos: true } });
  if (!v) return;
  await db.vehicle.delete({ where: { id } });
  await Promise.all(v.photos.map((p) => deleteVehiclePhotoFiles(p.filename)));
  revalidatePublic(v.slug);
  redirect("/admin/vehicles");
}

/* ───────────────────────── Photos ───────────────────────── */

export async function uploadPhoto(vehicleId: string, formData: FormData): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, message: "No file received." };
  const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId }, select: { slug: true, _count: { select: { photos: true } } } });
  if (!vehicle) return { ok: false, message: "Vehicle not found." };
  if (vehicle._count.photos >= 60) return { ok: false, message: "A vehicle can have at most 60 photos." };

  try {
    const saved = await saveVehiclePhoto(file);
    const last = await db.vehiclePhoto.findFirst({ where: { vehicleId }, orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
    await db.vehiclePhoto.create({ data: { vehicleId, ...saved, sortOrder: (last?.sortOrder ?? -1) + 1 } });
  } catch (err) {
    console.error("Photo upload failed:", err);
    return { ok: false, message: `${file.name}: couldn't read this image. Use JPG, PNG or WebP.` };
  }
  revalidatePublic(vehicle.slug);
  return { ok: true };
}

export async function deletePhoto(photoId: string) {
  await requireAdmin();
  const photo = await db.vehiclePhoto.findUnique({ where: { id: photoId }, include: { vehicle: { select: { slug: true } } } });
  if (!photo) return;
  await db.vehiclePhoto.delete({ where: { id: photoId } });
  await deleteVehiclePhotoFiles(photo.filename);
  revalidatePublic(photo.vehicle.slug);
}

export async function reorderPhotos(vehicleId: string, orderedIds: string[]) {
  await requireAdmin();
  const photos = await db.vehiclePhoto.findMany({ where: { vehicleId }, select: { id: true } });
  const valid = new Set(photos.map((p) => p.id));
  const ids = orderedIds.filter((id) => valid.has(id));
  for (const [i, id] of ids.entries()) await db.vehiclePhoto.update({ where: { id }, data: { sortOrder: i } });
  const v = await db.vehicle.findUnique({ where: { id: vehicleId }, select: { slug: true } });
  revalidatePublic(v?.slug);
}

/* ───────────────────────── Leads ───────────────────────── */

export async function setLeadStatus(id: string, status: string) {
  await requireAdmin();
  await db.lead.update({ where: { id }, data: { status: z.enum(LEAD_STATUSES).parse(status) } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function deleteLead(id: string) {
  await requireAdmin();
  await db.lead.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

/* ───────────────────────── Settings ───────────────────────── */

const passwordRule = z.string().min(10, "Use at least 10 characters.").max(200);

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const user = await db.adminUser.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(String(formData.get("current") || ""), user.passwordHash))) {
    return { ok: false, message: "Current password is incorrect.", errors: { current: "Incorrect password." } };
  }
  const next = passwordRule.safeParse(String(formData.get("next") || ""));
  if (!next.success) return { ok: false, message: next.error.issues[0].message, errors: { next: next.error.issues[0].message } };
  if (next.data !== formData.get("confirm")) return { ok: false, message: "Passwords don't match.", errors: { confirm: "Passwords don't match." } };
  await db.adminUser.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(next.data) } });
  return { ok: true, message: "Password updated." };
}

export async function addAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Name is required.").max(80),
      email: z.string().trim().toLowerCase().email("Enter a valid email."),
      password: passwordRule,
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
  if (await db.adminUser.findUnique({ where: { email: parsed.data.email } })) {
    return { ok: false, message: "That email already has an account.", errors: { email: "Already exists." } };
  }
  await db.adminUser.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) },
  });
  revalidatePath("/admin/settings");
  return { ok: true, message: `${parsed.data.name} can now sign in.` };
}

export async function removeAdmin(id: string) {
  const me = await requireAdmin();
  if (id === me.id) return;
  if ((await db.adminUser.count()) <= 1) return;
  await db.adminUser.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/settings");
}

export async function saveMailSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const notify = get("leadNotifyEmail")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (notify.some((e) => !z.string().email().safeParse(e).success)) {
    return { ok: false, message: "Enter valid email addresses, separated by commas.", errors: { leadNotifyEmail: "Invalid email." } };
  }
  const port = Number(get("smtpPort") || 465);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return { ok: false, message: "Enter a valid port (usually 465).", errors: { smtpPort: "Invalid port." } };

  await setSetting("leadNotifyEmail", notify.join(", "));
  await setSetting("smtpHost", get("smtpHost") || "smtp.hostinger.com");
  await setSetting("smtpPort", String(port));
  await setSetting("smtpUser", get("smtpUser"));
  await setSetting("smtpFrom", get("smtpFrom"));
  // Blank password field means "keep the saved one".
  const pass = String(formData.get("smtpPass") ?? "");
  if (pass) await setSetting("smtpPass", pass);

  revalidatePath("/admin/settings");
  if (formData.get("intent") === "test") {
    try {
      await sendTestEmail();
      const s = await getMailSettings();
      return { ok: true, message: `Saved. Test email sent to ${s.notifyEmail}. Check that inbox (and spam).` };
    } catch (err) {
      return { ok: false, message: `Saved, but the test email failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
  return { ok: true, message: "Email settings saved." };
}
