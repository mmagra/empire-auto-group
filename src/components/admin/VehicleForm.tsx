"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useCallback, useState, useTransition } from "react";
import { Check, CheckCircle2, Circle, Gauge, LoaderCircle, Save, ScanLine, Star } from "lucide-react";
import { saveVehicle, uploadPhoto, type FormState } from "@/app/admin/actions";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { CarPlaceholder } from "@/components/site/CarPlaceholder";
import { Select } from "@/components/ui/Select";
import { BODY_TYPES, DRIVETRAINS, FEATURE_PRESETS, FUEL_TYPES, STATUS_LABEL, TRANSMISSIONS, VEHICLE_STATUSES } from "@/lib/constants";
import { formatNumber, formatPrice } from "@/lib/format";

export type VehicleFormValues = {
  id?: string;
  status: string;
  featured: boolean;
  vin: string;
  stockNumber: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  bodyType: string;
  price: string;
  salePrice: string;
  mileage: string;
  exteriorColor: string;
  interiorColor: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  engine: string;
  description: string;
  features: string[];
};

const DECODED = ["year", "make", "model", "trim", "bodyType", "drivetrain", "fuelType", "engine", "transmission"] as const;

const STATUS_HELP: Record<string, string> = {
  DRAFT: "Hidden from the website",
  AVAILABLE: "Shown for sale",
  PENDING: "Shown with a Sale Pending badge",
  SOLD: "Hidden from the website",
};

const digits = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;

/** Numbered card used for each part of the form. */
function Section({ n, title, hint, children, action }: { n: number; title: string; hint?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold font-display text-sm text-black">{n}</span>
          <div>
            <h2 className="font-display text-base uppercase tracking-wide text-text">{title}</h2>
            {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function VehicleForm({ initial, photos }: { initial: VehicleFormValues; photos?: { id: string; url: string }[] }) {
  const router = useRouter();
  // Editing uses the action state; creating runs save → upload chosen photos → open the edit page.
  const [editState, action, editPending] = useActionState<FormState, FormData>(saveVehicle, null);
  const [createState, setCreateState] = useState<FormState>(null);
  const [creating, startCreate] = useTransition();
  const [queue, setQueue] = useState<File[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>(photos?.map((p) => p.url) ?? []);
  const state = initial.id ? editState : createState;
  const pending = editPending || creating;

  const [values, setValues] = useState(initial);
  const [decoding, setDecoding] = useState(false);
  const [decodeMsg, setDecodeMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const onPhotosChange = useCallback((urls: string[]) => setPhotoUrls(urls), []);

  const set = (k: keyof VehicleFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const err = (k: string) => state?.errors?.[k];
  const customFeatures = initial.features.filter((f) => !FEATURE_PRESETS.includes(f)).join("\n");

  async function decode() {
    const vin = values.vin.trim().toUpperCase();
    if (vin.length !== 17) {
      setDecodeMsg({ ok: false, text: "Enter all 17 characters of the VIN first." });
      return;
    }
    setDecoding(true);
    setDecodeMsg(null);
    try {
      const res = await fetch(`/api/vin/${vin}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed.");
      setValues((v) => {
        const next = { ...v, vin };
        for (const k of DECODED) if (data[k]) next[k] = String(data[k]);
        return next;
      });
      setDecodeMsg({ ok: true, text: `Found: ${data.year} ${data.make} ${data.model}. Details filled in below. Please check them.` });
    } catch (e) {
      setDecodeMsg({ ok: false, text: e instanceof Error ? e.message : "Lookup failed." });
    } finally {
      setDecoding(false);
    }
  }

  const field = (name: keyof VehicleFormValues, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, className = "") => (
    <div className={className}>
      <label className="label" htmlFor={`vf-${name}`}>
        {label}
      </label>
      <input id={`vf-${name}`} name={name} value={values[name] as string} onChange={set(name)} className="input" aria-invalid={!!err(name)} {...props} />
      {err(name) && <p className="mt-1 text-xs text-danger">{err(name)}</p>}
    </div>
  );

  const select = (name: keyof VehicleFormValues, label: string, options: string[]) => (
    <div>
      <label className="label" htmlFor={`vf-${name}`}>
        {label}
      </label>
      <Select
        id={`vf-${name}`}
        name={name}
        value={values[name] as string}
        onChange={(v) => setValues((cur) => ({ ...cur, [name]: v }))}
        // Keep a decoded/legacy value selectable even if it's not a preset
        options={[{ value: "", label: "Select" }, ...new Set([...options, ...(values[name] ? [values[name] as string] : [])])]}
      />
    </div>
  );

  // Live preview + checklist
  const price = digits(values.price);
  const sale = digits(values.salePrice);
  const shownPrice = sale && sale < price ? sale : price;
  const title = [values.year, values.make, values.model].filter(Boolean).join(" ");
  const checklist = [
    { done: photoUrls.length > 0, label: "At least one photo" },
    { done: Boolean(values.year && values.make && values.model), label: "Year, make and model" },
    { done: price > 0, label: "Price" },
    { done: values.mileage.trim() !== "", label: "Mileage" },
    { done: values.description.trim().length > 20, label: "A short description", optional: true },
  ];
  const submitLabel = progress ?? (values.id ? "Save Changes" : queue.length ? `Create Vehicle (${queue.length} photo${queue.length === 1 ? "" : "s"})` : "Create Vehicle");

  const saveButton = (className: string) => (
    <button className={`btn btn-gold ${className}`} disabled={pending}>
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
      {submitLabel}
    </button>
  );

  return (
    <form
      className="pb-24 xl:pb-0"
      onSubmit={(e) => {
        // Keep unsaved input if validation fails.
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (values.id) {
          startTransition(() => action(fd));
          return;
        }
        startCreate(async () => {
          const res = await saveVehicle(null, fd);
          setCreateState(res);
          if (!res?.ok || !res.id) return;
          const failed: string[] = [];
          for (let i = 0; i < queue.length; i++) {
            setProgress(`Uploading photo ${i + 1} of ${queue.length}…`);
            const pfd = new FormData();
            pfd.append("file", queue[i]);
            const up = await uploadPhoto(res.id, pfd).catch(() => ({ ok: false }));
            if (!up.ok) failed.push(queue[i].name);
          }
          setProgress("Opening your new listing…");
          router.push(`/admin/vehicles/${res.id}?created=1${failed.length ? `&failed=${failed.length}` : ""}`);
        });
      }}
    >
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem] xl:items-start">
        {/* ───────── Main column ───────── */}
        <div className="min-w-0 space-y-6">
          <Section n={1} title="Photos" hint="Add as many as you like. The first one (gold frame) is the main photo shoppers see first.">
            {values.id ? (
              <PhotoManager vehicleId={values.id} photos={photos ?? []} onPhotosChange={onPhotosChange} />
            ) : (
              <PhotoManager onQueueChange={setQueue} onPhotosChange={onPhotosChange} />
            )}
          </Section>

          <Section n={2} title="Vehicle" hint="Have the VIN? Enter it and press Find to fill in most of this automatically.">
            <div className="rounded-xl bg-surface-2 p-4">
              <label className="label" htmlFor="vf-vin">
                VIN (optional)
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="vf-vin"
                  name="vin"
                  value={values.vin}
                  onChange={(e) => setValues((v) => ({ ...v, vin: e.target.value.toUpperCase() }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      decode();
                    }
                  }}
                  maxLength={17}
                  placeholder="17-character VIN"
                  className="input flex-1 bg-surface font-mono tracking-wider"
                  aria-invalid={!!err("vin")}
                />
                <button type="button" onClick={decode} disabled={decoding} className="btn btn-ghost bg-surface">
                  {decoding ? <LoaderCircle className="size-4 animate-spin" /> : <ScanLine className="size-4" />} Find Details
                </button>
              </div>
              {err("vin") && <p className="mt-1 text-xs text-danger">{err("vin")}</p>}
              {decodeMsg && <p className={`mt-2 text-sm ${decodeMsg.ok ? "text-success" : "text-danger"}`}>{decodeMsg.text}</p>}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {field("year", "Year *", { inputMode: "numeric", required: true, maxLength: 4, placeholder: "2020" })}
              {field("make", "Make *", { required: true, placeholder: "Toyota" })}
              {field("model", "Model *", { required: true, placeholder: "Camry" })}
              {field("trim", "Trim", { placeholder: "SE" })}
              {select("bodyType", "Body style", BODY_TYPES)}
              {field("stockNumber", "Stock #", { placeholder: "Optional" })}
            </div>

            <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-subtle">Specs</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {select("transmission", "Transmission", TRANSMISSIONS)}
              {select("drivetrain", "Drivetrain", DRIVETRAINS)}
              {select("fuelType", "Fuel", FUEL_TYPES)}
              {field("engine", "Engine", { placeholder: "2.5L 4-Cyl" })}
              {field("exteriorColor", "Exterior color", { placeholder: "Silver" })}
              {field("interiorColor", "Interior color", { placeholder: "Black" })}
            </div>
          </Section>

          <Section n={3} title="Price & Mileage">
            <div className="grid gap-4 sm:grid-cols-3">
              {field("price", "Price ($) *", { inputMode: "numeric", required: true, placeholder: "18,995" })}
              {field("salePrice", "Sale price ($)", { inputMode: "numeric", placeholder: "Optional" })}
              {field("mileage", "Mileage *", { inputMode: "numeric", required: true, placeholder: "54,000" })}
            </div>
            <p className="mt-2 text-xs text-subtle">Add a sale price to show the old price crossed out with a &ldquo;Price Drop&rdquo; badge.</p>
          </Section>

          <Section n={4} title="Features" hint="Tap everything this vehicle has.">
            <div className="flex flex-wrap gap-2">
              {FEATURE_PRESETS.map((f) => (
                <label key={f} className="cursor-pointer">
                  <input type="checkbox" name="features" value={f} defaultChecked={initial.features.includes(f)} className="peer sr-only" />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-text/80 transition hover:border-gold/60 peer-checked:border-gold peer-checked:bg-gold/15 peer-checked:font-semibold peer-checked:text-text peer-focus-visible:ring-2 peer-focus-visible:ring-gold">
                    <Check className="hidden size-3.5 text-gold-ink [input:checked+span>&]:block" />
                    {f}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-5">
              <label className="label" htmlFor="vf-custom">
                Anything else? (one per line)
              </label>
              <textarea id="vf-custom" name="customFeatures" rows={2} defaultValue={customFeatures} className="input" placeholder={"Roof rack\nRunning boards"} />
            </div>
          </Section>

          <Section n={5} title="Description" hint="A few friendly sentences: condition, history, recent work.">
            <textarea
              id="vf-description"
              name="description"
              rows={6}
              value={values.description}
              onChange={set("description")}
              className="input"
              placeholder="Clean title, one owner, new tires, recently serviced…"
            />
          </Section>
        </div>

        {/* ───────── Sidebar ───────── */}
        <aside className="space-y-5 xl:sticky xl:top-6">
          {/* Live preview of the website card */}
          <div className="card overflow-hidden">
            <p className="border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">Preview on website</p>
            <div className="relative aspect-[4/3] bg-surface-2">
              {photoUrls[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrls[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <CarPlaceholder label="No photo yet" />
              )}
              {sale > 0 && sale < price && <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-0.5 text-[0.65rem] font-bold uppercase text-black">Price Drop</span>}
              {photoUrls.length > 1 && <span className="absolute bottom-2 right-2 rounded-md bg-black/65 px-2 py-0.5 text-[0.7rem] text-white">{photoUrls.length} photos</span>}
            </div>
            <div className="p-5">
              <p className="font-display text-lg uppercase leading-tight text-text">{title || "Year Make Model"}</p>
              {values.trim && <p className="text-sm text-muted">{values.trim}</p>}
              <div className="mt-3 flex items-end justify-between">
                <p className="text-gold-grad font-display text-2xl">{shownPrice ? formatPrice(shownPrice) : "$—"}</p>
                {values.mileage && (
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <Gauge className="size-3.5" /> {formatNumber(digits(values.mileage))} mi
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status + featured */}
          <div className="card space-y-4 p-5">
            <div>
              <p className="label">Status</p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Status">
                {VEHICLE_STATUSES.map((s) => (
                  <label key={s} className="cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={values.status === s}
                      onChange={() => setValues((v) => ({ ...v, status: s }))}
                      className="peer sr-only"
                    />
                    <span className="block rounded-lg border border-line px-3 py-2 text-center text-sm font-semibold text-muted transition hover:border-gold/60 peer-checked:border-gold peer-checked:bg-gold/15 peer-checked:text-text peer-focus-visible:ring-2 peer-focus-visible:ring-gold">
                      {STATUS_LABEL[s]}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-subtle">{STATUS_HELP[values.status]}</p>
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-text">
                <Star className={`size-4 ${values.featured ? "fill-gold text-gold-ink" : "text-muted"}`} /> Feature on home page
              </span>
              <input type="checkbox" name="featured" checked={values.featured} onChange={(e) => setValues((v) => ({ ...v, featured: e.target.checked }))} className="peer sr-only" />
              <span className="relative h-6 w-11 shrink-0 rounded-full bg-surface-3 transition after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-gold peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-gold" />
            </label>
          </div>

          {/* Checklist + save */}
          <div className="card space-y-4 p-5">
            <div>
              <p className="label">Ready to publish?</p>
              <ul className="space-y-1.5 text-sm">
                {checklist.map((c) => (
                  <li key={c.label} className={`flex items-center gap-2 ${c.done ? "text-text" : "text-muted"}`}>
                    {c.done ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-subtle" />}
                    {c.label}
                    {c.optional && !c.done && <span className="text-xs text-subtle">(optional)</span>}
                  </li>
                ))}
              </ul>
            </div>

            {state && (
              <p
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${state.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                role={state.ok ? "status" : "alert"}
              >
                {state.ok && <CheckCircle2 className="size-4" />} {state.message}
              </p>
            )}
            {saveButton("hidden w-full xl:inline-flex")}
          </div>
        </aside>
      </div>

      {/* Phones and tablets: save button always in reach */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 p-3 backdrop-blur xl:hidden">
        {saveButton("w-full")}
      </div>
    </form>
  );
}
