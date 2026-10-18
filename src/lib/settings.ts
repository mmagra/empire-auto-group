import "server-only";
import { db } from "./db";

export async function getSetting(key: string) {
  const row = await db.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

/** Email settings are edited in Admin → Settings (no environment variables). */
export type MailSettings = {
  notifyEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
};

export const MAIL_KEYS = ["leadNotifyEmail", "smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom"] as const;

export async function getMailSettings(): Promise<MailSettings> {
  const rows = await db.setting.findMany({ where: { key: { in: [...MAIL_KEYS] } } });
  const v = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
  return {
    notifyEmail: v.leadNotifyEmail ?? "",
    smtpHost: v.smtpHost || "smtp.hostinger.com",
    smtpPort: Number(v.smtpPort) || 465,
    smtpUser: v.smtpUser ?? "",
    smtpPass: v.smtpPass ?? "",
    smtpFrom: v.smtpFrom ?? "",
  };
}
