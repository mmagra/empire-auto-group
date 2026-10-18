"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteLead, setLeadStatus } from "@/app/admin/actions";
import { LEAD_STATUSES, LEAD_STATUS_LABEL } from "@/lib/constants";

export function LeadActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className={`mt-6 border-t border-line pt-5 ${pending ? "opacity-60" : ""}`}>
      <p className="label">Status</p>
      <div className="grid grid-cols-3 gap-2">
        {LEAD_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => start(() => setLeadStatus(id, s))}
            className={`rounded-lg border py-2 text-sm font-semibold transition ${
              status === s ? "border-gold bg-gold/10 text-gold-ink" : "border-line text-muted hover:border-gold/50 hover:text-text"
            }`}
          >
            {LEAD_STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this lead permanently?")) return;
          start(async () => {
            await deleteLead(id);
            router.replace("/admin/leads");
          });
        }}
        className="mt-4 inline-flex items-center gap-2 text-sm text-subtle hover:text-danger"
      >
        <Trash2 className="size-4" /> Delete lead
      </button>
    </div>
  );
}
