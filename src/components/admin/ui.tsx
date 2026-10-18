import { LEAD_STATUS_LABEL, LEAD_TYPE_LABEL, STATUS_LABEL, type LeadStatus, type LeadType, type VehicleStatus } from "@/lib/constants";

export function AdminHeader({ title, subtitle, actions }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-2xl uppercase text-text sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const STATUS_STYLE: Record<VehicleStatus, string> = {
  AVAILABLE: "bg-success/15 text-success ring-success/30",
  PENDING: "bg-gold/15 text-gold-ink ring-gold/30",
  SOLD: "bg-surface-3 text-muted ring-line",
  DRAFT: "bg-surface-3 text-subtle ring-line",
};

export function StatusBadge({ status }: { status: string }) {
  const s = status as VehicleStatus;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STATUS_STYLE[s] ?? STATUS_STYLE.DRAFT}`}>
      {STATUS_LABEL[s] ?? status}
    </span>
  );
}

const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  NEW: "bg-gold text-black ring-gold",
  CONTACTED: "bg-sky-500/10 text-sky-700 ring-sky-500/30",
  CLOSED: "bg-surface-3 text-muted ring-line",
};

export function LeadStatusBadge({ status }: { status: string }) {
  const s = status as LeadStatus;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${LEAD_STATUS_STYLE[s] ?? LEAD_STATUS_STYLE.CLOSED}`}>
      {LEAD_STATUS_LABEL[s] ?? status}
    </span>
  );
}

export function LeadTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex rounded-md border border-line bg-surface-2 px-2 py-0.5 text-xs text-text/80">
      {LEAD_TYPE_LABEL[type as LeadType] ?? type}
    </span>
  );
}

export function StatCard({ label, value, hint, icon }: { label: string; value: React.ReactNode; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">{label}</p>
        <span className="text-gold-ink">{icon}</span>
      </div>
      <p className="mt-3 font-display text-3xl text-text">{value}</p>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  );
}
