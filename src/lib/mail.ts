import "server-only";
import nodemailer from "nodemailer";
import { LEAD_TYPE_LABEL, type LeadType } from "./constants";
import { getMailSettings, type MailSettings } from "./settings";

function transport(s: MailSettings) {
  if (!s.smtpHost || !s.smtpUser || !s.smtpPass) return null;
  return nodemailer.createTransport({
    host: s.smtpHost,
    port: s.smtpPort,
    secure: s.smtpPort === 465,
    auth: { user: s.smtpUser, pass: s.smtpPass },
  });
}

export async function emailReady() {
  const s = await getMailSettings();
  return Boolean(transport(s) && s.notifyEmail);
}

/** Sends a test message with the saved settings. Throws with the SMTP error so the admin sees it. */
export async function sendTestEmail() {
  const s = await getMailSettings();
  const t = transport(s);
  if (!t) throw new Error("Fill in the SMTP username and password first.");
  if (!s.notifyEmail) throw new Error("Enter the email address that should receive leads.");
  await t.sendMail({
    from: s.smtpFrom || s.smtpUser,
    to: s.notifyEmail,
    subject: "Empire Auto Group: test email",
    text: "Email is set up correctly. New website leads will arrive at this address.",
  });
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type LeadEmail = {
  id: string;
  type: LeadType;
  name: string;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  details: Record<string, string>;
  vehicleTitle?: string | null;
  siteUrl: string;
};

/** Sends a new-lead alert. Never throws: the lead is already saved in the DB. */
export async function sendLeadNotification(lead: LeadEmail) {
  try {
    const s = await getMailSettings();
    const t = transport(s);
    if (!t || !s.notifyEmail) return;

    const rows: [string, string][] = [
      ["Type", LEAD_TYPE_LABEL[lead.type]],
      ["Name", lead.name],
      ["Phone", lead.phone || "-"],
      ["Email", lead.email || "-"],
      ...(lead.vehicleTitle ? ([["Vehicle", lead.vehicleTitle]] as [string, string][]) : []),
      ...Object.entries(lead.details),
      ["Message", lead.message || "-"],
    ];
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px">
        <h2 style="margin:0 0 12px">New ${escape(LEAD_TYPE_LABEL[lead.type])} lead</h2>
        <table cellpadding="6" style="border-collapse:collapse;width:100%">
          ${rows
            .map(
              ([k, v]) =>
                `<tr><td style="border-bottom:1px solid #eee;color:#666;width:140px;vertical-align:top">${escape(k)}</td><td style="border-bottom:1px solid #eee;white-space:pre-wrap">${escape(v)}</td></tr>`,
            )
            .join("")}
        </table>
        <p style="margin-top:16px"><a href="${lead.siteUrl}/admin/leads?id=${lead.id}">Open in admin</a></p>
      </div>`;

    await t.sendMail({
      from: s.smtpFrom || s.smtpUser,
      to: s.notifyEmail,
      replyTo: lead.email || undefined,
      subject: `New ${LEAD_TYPE_LABEL[lead.type].toLowerCase()} lead: ${lead.name}`,
      html,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    });
  } catch (err) {
    console.error("Lead email failed:", err);
  }
}
