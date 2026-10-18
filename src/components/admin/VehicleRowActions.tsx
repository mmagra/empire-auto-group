"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Copy, ExternalLink, Pencil, Star, Trash2 } from "lucide-react";
import { deleteVehicle, duplicateVehicle, setVehicleStatus, toggleFeatured } from "@/app/admin/actions";
import { STATUS_LABEL, VEHICLE_STATUSES } from "@/lib/constants";
import { Select } from "@/components/ui/Select";

const STATUS_DOT: Record<string, string> = {
  AVAILABLE: "bg-success",
  PENDING: "bg-gold",
  SOLD: "bg-muted",
  DRAFT: "bg-subtle",
};

export function VehicleRowActions({
  id,
  status,
  featured,
  slug,
  mode,
}: {
  id: string;
  status: string;
  featured: boolean;
  slug: string;
  mode: "status" | "menu" | "detail";
}) {
  const [pending, start] = useTransition();

  if (mode === "status") {
    return (
      <div className="flex items-center gap-2">
        <span className={`size-2.5 shrink-0 rounded-full ${STATUS_DOT[status] ?? "bg-subtle"}`} aria-hidden />
        <Select
          aria-label="Status"
          size="sm"
          className="w-36"
          value={status}
          disabled={pending}
          onChange={(v) => start(() => setVehicleStatus(id, v))}
          options={VEHICLE_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
        />
      </div>
    );
  }

  const btn = "inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-surface-3 hover:text-gold-ink disabled:opacity-40";
  return (
    <div className={`flex justify-end gap-1 ${pending ? "opacity-50" : ""}`}>
      {mode === "menu" && (
      <button type="button" className={btn} title={featured ? "Remove from featured" : "Feature on home page"} disabled={pending} onClick={() => start(() => toggleFeatured(id))}>
        <Star className={`size-4 ${featured ? "fill-gold text-gold-ink" : ""}`} />
      </button>
      )}
      {mode === "menu" && (
        <Link href={`/admin/vehicles/${id}`} className={btn} title="Edit">
          <Pencil className="size-4" />
        </Link>
      )}
      {mode === "menu" && (status === "AVAILABLE" || status === "PENDING") && (
        <a href={`/inventory/${slug}`} target="_blank" className={btn} title="View on website">
          <ExternalLink className="size-4" />
        </a>
      )}
      <button type="button" className={btn} title="Duplicate" disabled={pending} onClick={() => start(() => duplicateVehicle(id))}>
        <Copy className="size-4" />
      </button>
      <button
        type="button"
        className={`${btn} hover:!text-danger`}
        title="Delete"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this vehicle and all its photos? This can't be undone.")) start(() => deleteVehicle(id));
        }}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
