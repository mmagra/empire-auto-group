import { BODY_TYPES, SERVICE_TYPES } from "@/lib/constants";
import type { ServiceForm as FormKind } from "@/content/services";
import { Select } from "@/components/ui/Select";
import { LeadForm } from "./LeadForm";

// Extra fields are named d_<key> so they're saved as lead details and shown in the admin.

function ServiceRequestFields({ preselect }: { preselect?: string }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="svc-type">
          Service needed
        </label>
        <Select id="svc-type" name="d_service" defaultValue={preselect ?? ""} options={[{ value: "", label: "Select a service" }, ...SERVICE_TYPES]} />
      </div>
      <div>
        <label className="label" htmlFor="svc-date">
          Preferred date
        </label>
        <input id="svc-date" type="date" name="d_preferredDate" min={today} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="svc-vehicle">
          Your vehicle
        </label>
        <input id="svc-vehicle" name="d_vehicle" className="input" placeholder="Year, make, model (e.g. 2018 Toyota Camry)" />
      </div>
    </div>
  );
}

function TradeInFields() {
  const thisYear = new Date().getFullYear();
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div>
        <label className="label" htmlFor="ti-year">
          Year *
        </label>
        <Select id="ti-year" name="d_year" required placeholder="Year" options={Array.from({ length: 30 }, (_, i) => String(thisYear + 1 - i))} />
      </div>
      <div>
        <label className="label" htmlFor="ti-make">
          Make *
        </label>
        <input id="ti-make" name="d_make" className="input" required placeholder="Honda" />
      </div>
      <div>
        <label className="label" htmlFor="ti-model">
          Model *
        </label>
        <input id="ti-model" name="d_model" className="input" required placeholder="Civic" />
      </div>
      <div>
        <label className="label" htmlFor="ti-trim">
          Trim
        </label>
        <input id="ti-trim" name="d_trim" className="input" placeholder="EX" />
      </div>
      <div>
        <label className="label" htmlFor="ti-miles">
          Mileage *
        </label>
        <input id="ti-miles" name="d_mileage" className="input" inputMode="numeric" required placeholder="85,000" />
      </div>
      <div>
        <label className="label" htmlFor="ti-cond">
          Condition
        </label>
        <Select id="ti-cond" name="d_condition" options={[{ value: "", label: "Select" }, "Excellent", "Good", "Fair", "Needs work"]} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="ti-vin">
          VIN (optional)
        </label>
        <input id="ti-vin" name="d_vin" className="input uppercase" maxLength={17} placeholder="17 characters" />
      </div>
      <div>
        <label className="label" htmlFor="ti-payoff">
          Still owe on it?
        </label>
        <Select id="ti-payoff" name="d_owesMoney" options={[{ value: "", label: "Select" }, "No, paid off", "Yes, still owe"]} />
      </div>
    </div>
  );
}

function FinancingFields() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="d_topic" value="Financing paperwork" />
      <div>
        <label className="label" htmlFor="fin-vehicle">
          Vehicle you&apos;re interested in
        </label>
        <input id="fin-vehicle" name="d_vehicleOfInterest" className="input" placeholder="Optional" />
      </div>
      <div>
        <label className="label" htmlFor="fin-trade">
          Trading in a vehicle?
        </label>
        <Select id="fin-trade" name="d_tradeIn" options={[{ value: "", label: "Select" }, "Yes", "No", "Not sure yet"]} />
      </div>
    </div>
  );
}

function VehicleSearchFields() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <input type="hidden" name="d_topic" value="Vehicle search" />
      <div>
        <label className="label" htmlFor="vs-want">
          Make / model
        </label>
        <input id="vs-want" name="d_lookingFor" className="input" placeholder="e.g. Toyota RAV4" />
      </div>
      <div>
        <label className="label" htmlFor="vs-body">
          Body style
        </label>
        <Select id="vs-body" name="d_bodyStyle" options={[{ value: "", label: "Any" }, ...BODY_TYPES]} />
      </div>
      <div>
        <label className="label" htmlFor="vs-budget">
          Budget
        </label>
        <Select
          id="vs-budget"
          name="d_budget"
          options={[{ value: "", label: "Any" }, "Under $10,000", "$10,000–$15,000", "$15,000–$20,000", "$20,000–$30,000", "$30,000+"]}
        />
      </div>
    </div>
  );
}

export const FORM_COPY: Record<FormKind, { title: string; text: string }> = {
  service: { title: "Request An Appointment", text: "Tell us what you need and when works for you. We'll call to confirm your time." },
  "trade-in": { title: "Get Your Trade-In Offer", text: "The more detail you share, the more accurate our offer." },
  financing: { title: "Ask About Financing Paperwork", text: "Send us a quick message and we'll reach out to go over the paperwork with you. No credit application online." },
  "vehicle-search": { title: "Can't Find It? We'll Look", text: "Tell us what you want and we'll let you know when we have a match." },
};

export function ServiceRequestForm({ kind, preselect }: { kind: FormKind; preselect?: string }) {
  switch (kind) {
    case "trade-in":
      return (
        <LeadForm type="TRADE_IN" submitLabel="Get My Offer" messageLabel="Anything we should know?" messagePlaceholder="Accidents, recent repairs, new tires, etc.">
          <TradeInFields />
        </LeadForm>
      );
    case "financing":
      return (
        <LeadForm type="CONTACT" submitLabel="Send My Question" messageLabel="Your question" messagePlaceholder="Tell us a bit about what you're looking for.">
          <FinancingFields />
        </LeadForm>
      );
    case "vehicle-search":
      return (
        <LeadForm type="CONTACT" submitLabel="Find My Car" messageLabel="Must-haves" messagePlaceholder="e.g. AWD, third row, under 60k miles">
          <VehicleSearchFields />
        </LeadForm>
      );
    default:
      return (
        <LeadForm type="SERVICE" submitLabel="Request Appointment" messageLabel="Describe the issue" messagePlaceholder="e.g. Squeaking when braking, due for an oil change…">
          <ServiceRequestFields preselect={preselect} />
        </LeadForm>
      );
  }
}
