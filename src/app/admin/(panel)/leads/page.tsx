import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { CarFront, Mail, MessageSquare, Phone, X } from "lucide-react";
import { db } from "@/lib/db";
import { LEAD_STATUSES, LEAD_STATUS_LABEL, LEAD_TYPES, LEAD_TYPE_LABEL } from "@/lib/constants";
import { formatDateTime, parseJson, vehicleTitle } from "@/lib/format";
import { AdminHeader, LeadStatusBadge, LeadTypeBadge } from "@/components/admin/ui";
import { LeadActions } from "@/components/admin/LeadActions";

export const metadata = { title: "Leads" };

const DETAIL_LABEL: Record<string, string> = {
  preferredDate: "Preferred date",
  preferredTime: "Preferred time",
  service: "Service",
  vehicle: "Vehicle",
  topic: "Topic",
  year: "Year",
  make: "Make",
  model: "Model",
  trim: "Trim",
  mileage: "Mileage",
  condition: "Condition",
  vin: "VIN",
  owesMoney: "Owes money",
  vehicleOfInterest: "Vehicle of interest",
  tradeIn: "Trading in",
  lookingFor: "Looking for",
  bodyStyle: "Body style",
  budget: "Budget",
};

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ type?: string; status?: string; id?: string }> }) {
  const sp = await searchParams;
  const type = LEAD_TYPES.includes(sp.type as never) ? sp.type : undefined;
  const status = LEAD_STATUSES.includes(sp.status as never) ? sp.status : undefined;
  const where: Prisma.LeadWhereInput = { ...(type ? { type } : {}), ...(status ? { status } : {}) };

  const [leads, selected] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { vehicle: { select: { year: true, make: true, model: true, trim: true } } },
    }),
    sp.id ? db.lead.findUnique({ where: { id: sp.id }, include: { vehicle: true } }) : null,
  ]);

  const href = (changes: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { type, status, ...changes };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/admin/leads${p.size ? `?${p}` : ""}`;
  };

  const chip = (active: boolean) =>
    `shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition ${active ? "bg-gold text-black" : "text-muted hover:text-text"}`;

  return (
    <>
      <AdminHeader title="Leads" subtitle="Every form submitted on the website: car inquiries, trade-ins, service requests and messages." />

      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg border border-line bg-ink p-1">
          <Link href={href({ type: undefined, id: undefined })} className={chip(!type)}>
            All types
          </Link>
          {LEAD_TYPES.map((t) => (
            <Link key={t} href={href({ type: t, id: undefined })} className={chip(type === t)}>
              {LEAD_TYPE_LABEL[t]}
            </Link>
          ))}
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg border border-line bg-ink p-1">
          <Link href={href({ status: undefined, id: undefined })} className={chip(!status)}>
            Any status
          </Link>
          {LEAD_STATUSES.map((s) => (
            <Link key={s} href={href({ status: s, id: undefined })} className={chip(status === s)}>
              {LEAD_STATUS_LABEL[s]}
            </Link>
          ))}
        </div>
      </div>

      <div className={`grid gap-6 ${selected ? "xl:grid-cols-[1fr_26rem]" : ""}`}>
        <div className="card overflow-hidden">
          {leads.length ? (
            <ul className="divide-y divide-line">
              {leads.map((l) => (
                <li key={l.id}>
                  <Link
                    href={href({ id: l.id })}
                    scroll={false}
                    className={`flex flex-col gap-2 px-5 py-4 transition sm:flex-row sm:items-center sm:justify-between ${
                      selected?.id === l.id ? "bg-gold/5" : "hover:bg-surface-2"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`truncate ${l.status === "NEW" ? "font-semibold text-text" : "text-text/85"}`}>{l.name}</p>
                      <p className="truncate text-xs text-muted">
                        {[l.phone, l.email].filter(Boolean).join(" · ")}
                        {l.vehicle ? ` · ${vehicleTitle(l.vehicle)}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-subtle">{formatDateTime(l.createdAt)}</span>
                      <LeadTypeBadge type={l.type} />
                      <LeadStatusBadge status={l.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-16 text-center text-sm text-muted">No leads here yet.</p>
          )}
        </div>

        {selected && (
          <aside className="card h-fit p-6 xl:sticky xl:top-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <LeadTypeBadge type={selected.type} />
                <h2 className="mt-2 font-display text-xl uppercase text-text">{selected.name}</h2>
                <p className="text-xs text-subtle">{formatDateTime(selected.createdAt)}</p>
              </div>
              <Link href={href({ id: undefined })} scroll={false} className="text-muted hover:text-text" aria-label="Close">
                <X className="size-5" />
              </Link>
            </div>

            <div className="mt-5 grid gap-2">
              {selected.phone && (
                <a href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`} className="btn btn-gold btn-sm justify-start">
                  <Phone className="size-4" /> {selected.phone}
                </a>
              )}
              {selected.phone && (
                <a href={`sms:${selected.phone.replace(/[^\d+]/g, "")}`} className="btn btn-ghost btn-sm justify-start">
                  <MessageSquare className="size-4" /> Text {selected.phone}
                </a>
              )}
              {selected.email && (
                <a href={`mailto:${selected.email}`} className="btn btn-ghost btn-sm justify-start">
                  <Mail className="size-4" /> {selected.email}
                </a>
              )}
            </div>

            {selected.vehicle && (
              <Link href={`/admin/vehicles/${selected.vehicle.id}`} className="mt-5 flex items-center gap-3 rounded-lg border border-line bg-surface-2 p-3 text-sm hover:border-gold/50">
                <CarFront className="size-5 text-gold-ink" />
                <span>
                  {vehicleTitle(selected.vehicle)}
                  {selected.vehicle.stockNumber && <span className="text-subtle"> · #{selected.vehicle.stockNumber}</span>}
                </span>
              </Link>
            )}

            {Object.keys(parseJson<Record<string, string>>(selected.details, {})).length > 0 && (
              <dl className="mt-5 divide-y divide-line rounded-lg border border-line text-sm">
                {Object.entries(parseJson<Record<string, string>>(selected.details, {})).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-3 py-2">
                    <dt className="text-muted">{DETAIL_LABEL[k] ?? k}</dt>
                    <dd className="text-right text-text">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {selected.message && (
              <div className="mt-5">
                <p className="label">Message</p>
                <p className="whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-sm text-text/90">{selected.message}</p>
              </div>
            )}

            <LeadActions id={selected.id} status={selected.status} />
          </aside>
        )}
      </div>
    </>
  );
}
