import { MessageSquare } from "lucide-react";
import { LeadForm } from "./LeadForm";

/** Inquiry form on each vehicle page. Saved as a "Vehicle inquiry" lead linked to the car. */
export function VehicleInquiry({ vehicleId, title }: { vehicleId: string; title: string }) {
  return (
    <div className="card p-6" id="inquire">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-ink">
          <MessageSquare className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg uppercase leading-tight text-text">Have a Question?</h2>
          <p className="text-sm text-muted">Ask about this car and we&apos;ll get right back to you.</p>
        </div>
      </div>
      <LeadForm type="VEHICLE_INQUIRY" vehicleId={vehicleId} compact submitLabel="Send Inquiry" defaultMessage={`Hi, is the ${title} still available?`} />
    </div>
  );
}
