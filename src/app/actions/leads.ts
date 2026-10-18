"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { LEAD_TYPES, PUBLIC_STATUSES, type LeadType } from "@/lib/constants";
import { vehicleTitle } from "@/lib/format";
import { sendLeadNotification } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/site-url";

export type LeadFormState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

const leadSchema = z
  .object({
    type: z.enum(LEAD_TYPES),
    name: z.string().trim().min(2, "Please enter your name.").max(100),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine((v) => !v || v.replace(/\D/g, "").length >= 10, "Please enter a valid phone number."),
    email: z.union([z.literal(""), z.string().trim().email("Please enter a valid email.").max(200)]),
    message: z.string().trim().max(3000).optional(),
    vehicleId: z.string().max(40).optional(),
  })
  .refine((d) => d.phone || d.email, { message: "Please give us a phone number or email so we can reach you.", path: ["phone"] });

const MIN_FILL_MS = 2500;

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  // Bots: hidden honeypot filled in, or submitted faster than a human could type.
  const honeypot = String(formData.get("company_website") || "");
  const startedAt = Number(formData.get("_ts") || 0);
  if (honeypot || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return { ok: true, message: "Thanks! We'll be in touch shortly." };
  }

  if (!rateLimit(`lead:${await clientIp()}`, 6, 10 * 60 * 1000)) {
    return { ok: false, message: `Too many requests. Please call us at 603-858-8844.` };
  }

  const parsed = leadSchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    message: formData.get("message") ?? "",
    vehicleId: formData.get("vehicleId") || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }

  // Type-specific fields arrive as d_<name>; keep them as a flat string map.
  const details: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("d_") && typeof value === "string" && value.trim()) {
      details[key.slice(2)] = value.trim().slice(0, 500);
    }
  }

  const data = parsed.data;
  const vehicle = data.vehicleId
    ? await db.vehicle.findFirst({ where: { id: data.vehicleId, status: { in: PUBLIC_STATUSES } } })
    : null;

  const lead = await db.lead.create({
    data: {
      type: data.type,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      message: data.message || null,
      details: JSON.stringify(details),
      vehicleId: vehicle?.id ?? null,
    },
  });

  await sendLeadNotification({
    id: lead.id,
    type: data.type as LeadType,
    name: data.name,
    phone: data.phone,
    email: data.email,
    message: data.message,
    details,
    siteUrl: await siteUrl(),
    vehicleTitle: vehicle ? `${vehicleTitle(vehicle)}${vehicle.stockNumber ? ` (Stock #${vehicle.stockNumber})` : ""}` : null,
  });

  return { ok: true, message: "Thanks! We received your request and will reach out shortly." };
}
