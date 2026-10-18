import Link from "next/link";
import {
  AlertTriangle,
  BadgeDollarSign,
  Battery,
  CarFront,
  Check,
  Cog,
  Disc,
  Droplets,
  Gauge,
  KeyRound,
  Repeat,
  Sparkles,
  Thermometer,
  Volume2,
  Waves,
  Wind,
  Wrench,
  X,
} from "lucide-react";
import type { Infographic } from "@/content/services";
import { BodyStyleIcon } from "./BodyStyleIcon";
import { Reveal } from "./Reveal";

/* Shared frame so every infographic reads as one family */
function Frame({ eyebrow, title, note, children }: { eyebrow: string; title: React.ReactNode; note?: string; children: React.ReactNode }) {
  return (
    <section id="guide" className="py-20">
      <div className="container-x">
        <Reveal className="card relative overflow-hidden p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="text-chrome mt-3 font-display text-2xl uppercase leading-tight sm:text-3xl">{title}</h2>
            <div className="mt-8">{children}</div>
            {note && <p className="mt-6 text-xs leading-relaxed text-subtle">{note}</p>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Car sales: shop by body style ───────── */
export function BodyStyleShop({ counts }: { counts: Record<string, number> }) {
  const styles = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Minivan"];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {styles.map((s) => (
        <Link
          key={s}
          href={`/inventory?body=${encodeURIComponent(s)}`}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-5 text-center transition hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_12px_30px_-16px_rgb(0_0_0/0.25)]"
        >
          <BodyStyleIcon style={s} className="h-10 w-24 text-text/80 transition group-hover:text-gold-ink" />
          <span className="font-display text-sm uppercase tracking-wider text-text">{s}</span>
          <span className="text-xs text-muted">{counts[s] ? `${counts[s]} available` : "Ask about it"}</span>
        </Link>
      ))}
    </div>
  );
}

/* ───────── Trade-in: what moves the value ───────── */
function TradeValue() {
  const factors = [
    { label: "Mileage", level: 3, text: "Lower miles usually means more value." },
    { label: "Overall Condition", level: 3, text: "Body, interior, tires and how it runs." },
    { label: "Service History", level: 2, text: "Records show the car was cared for." },
    { label: "Market Demand", level: 2, text: "Popular models in our area hold value." },
    { label: "Trim & Options", level: 1, text: "Features like AWD, leather or a sunroof." },
  ];
  const words = ["", "Some impact", "Medium impact", "Big impact"];
  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <ul className="space-y-5">
        {factors.map((f) => (
          <li key={f.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-sm uppercase text-text">{f.label}</span>
              <span className="text-xs font-semibold text-gold-ink">{words[f.level]}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((n) => (
                <span key={n} className={`h-2.5 rounded-full ${n <= f.level ? "bg-gradient-to-r from-gold-light to-gold-deep" : "bg-surface-3"}`} />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted">{f.text}</p>
          </li>
        ))}
      </ul>
      <div className="rounded-2xl bg-surface-2 p-6">
        <p className="font-display text-sm uppercase tracking-wider text-gold-ink">Boost your offer</p>
        <ul className="mt-4 space-y-3 text-sm text-text/90">
          {["Give it a good clean inside and out", "Gather your service records", "Bring every key and remote", "Have your title or payoff details ready", "Mention recent work like new tires or brakes"].map((t) => (
            <li key={t} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-gold-ink" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ───────── Maintenance: typical intervals ───────── */
function MaintenanceSchedule() {
  const MAX = 30000;
  const rows = [
    { icon: Droplets, label: "Oil & filter", every: 5000, range: "3,000–10,000 mi", href: "/services/oil-change" },
    { icon: Repeat, label: "Tire rotation", every: 6000, range: "5,000–7,500 mi", href: "/services/tires" },
    { icon: Disc, label: "Brake inspection", every: 12000, range: "10,000–12,000 mi", href: "/services/brakes" },
    { icon: Wind, label: "Engine air filter", every: 15000, range: "15,000–30,000 mi", href: "/services/general-repair" },
    { icon: Thermometer, label: "Coolant check", every: 30000, range: "Per owner's manual", href: "/services/general-repair" },
  ];
  return (
    <div>
      <div className="hidden pl-[11.5rem] text-xs text-subtle sm:flex sm:justify-between">
        {[0, 10000, 20000, 30000].map((m) => (
          <span key={m}>{m ? `${m / 1000}k mi` : "0"}</span>
        ))}
      </div>
      <ul className="mt-3 space-y-4">
        {rows.map((r) => {
          const marks = Array.from({ length: Math.floor(MAX / r.every) }, (_, i) => ((i + 1) * r.every) / MAX);
          return (
            <li key={r.label} className="grid items-center gap-3 sm:grid-cols-[11rem_1fr]">
              <Link href={r.href} className="flex items-center gap-2.5 hover:text-gold-ink">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-ink">
                  <r.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-text">{r.label}</span>
                  <span className="block text-xs text-muted">{r.range}</span>
                </span>
              </Link>
              <div className="relative h-3 rounded-full bg-surface-3">
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold/30 to-gold/60" style={{ width: `${marks[0] * 100}%` }} />
                {marks.map((m) => (
                  <span
                    key={m}
                    className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-gold-deep shadow"
                    style={{ left: `${m * 100}%` }}
                  />
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ───────── Brakes: warning signs ───────── */
function BrakeSigns() {
  const signs = [
    { icon: Volume2, title: "Squealing", text: "Pads are getting thin. Their wear indicators are talking.", level: "soon" },
    { icon: AlertTriangle, title: "Grinding", text: "Pads may be worn through to metal. Get it checked now.", level: "now" },
    { icon: Waves, title: "Vibration", text: "A pulsing pedal or shaking wheel often means warped rotors.", level: "soon" },
    { icon: Droplets, title: "Soft Pedal", text: "Spongy or sinking pedal can mean air or low brake fluid.", level: "now" },
    { icon: Repeat, title: "Pulling", text: "Car pulls to one side when braking: caliper or uneven wear.", level: "soon" },
    { icon: Gauge, title: "Warning Light", text: "Your dashboard brake light is on. Don't ignore it.", level: "now" },
  ];
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-gold" /> Book soon
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-danger" /> Get checked right away
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signs.map((s) => (
          <div key={s.title} className={`relative overflow-hidden rounded-2xl border bg-surface p-5 ${s.level === "now" ? "border-danger/40" : "border-gold/50"}`}>
            <span className={`absolute inset-y-0 left-0 w-1 ${s.level === "now" ? "bg-danger" : "bg-gold"}`} />
            <s.icon className={`size-6 ${s.level === "now" ? "text-danger" : "text-gold-ink"}`} />
            <p className="mt-3 font-display text-base uppercase text-text">{s.title}</p>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Tires: tread depth gauge ───────── */
function TireTread() {
  const marks = [
    { at: 10, label: "10/32\"", text: "New tire" },
    { at: 6, label: "6/32\"", text: "Good for most driving" },
    { at: 4, label: "4/32\"", text: "Replace before winter" },
    { at: 2, label: "2/32\"", text: "Legal minimum: replace now" },
  ];
  const pos = (v: number) => ((10 - v) / 8) * 100; // 10/32 -> 0%, 2/32 -> 100%
  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <div className="relative mt-10 h-4 rounded-full bg-gradient-to-r from-success via-gold to-danger">
          {marks.map((m) => (
            <div key={m.at} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos(m.at)}%` }}>
              <span className="block size-6 rounded-full border-4 border-surface bg-text shadow" />
            </div>
          ))}
        </div>
        <div className="relative mt-4 h-24">
          {marks.map((m, i) => (
            <div
              key={m.at}
              className={`absolute w-28 text-center ${i === 0 ? "translate-x-0 text-left" : i === marks.length - 1 ? "-translate-x-full text-right" : "-translate-x-1/2"}`}
              style={{ left: `${pos(m.at)}%` }}
            >
              <p className="font-display text-lg text-text">{m.label}</p>
              <p className="text-xs text-muted">{m.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-subtle">Tread depth in 32nds of an inch.</p>
      </div>
      <div className="space-y-3">
        {[
          { t: "The quarter test", d: "Put a quarter in the tread, Washington's head first. If you can see the top of his head, you're near 4/32\". Time to shop." },
          { t: "Check pressure monthly", d: "Cold weather lowers tire pressure, roughly 1 PSI for every 10°F drop. Use the number on your door sticker." },
          { t: "Rotate regularly", d: "Every 5,000–7,500 miles helps tires wear evenly and last longer." },
        ].map((x) => (
          <div key={x.t} className="rounded-xl bg-surface-2 p-4">
            <p className="text-sm font-semibold text-text">{x.t}</p>
            <p className="mt-1 text-sm text-muted">{x.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── General repair: what we look after ───────── */
function RepairAreas() {
  const areas = [
    { n: 1, x: 16, y: 50, icon: Cog, title: "Engine & Diagnostics", text: "Check-engine lights, misfires, leaks." },
    { n: 2, x: 31, y: 44, icon: Battery, title: "Battery & Electrical", text: "Starting, charging, lights and sensors." },
    { n: 3, x: 25, y: 56, icon: Wrench, title: "Suspension & Steering", text: "Clunks, rattles, pulling and alignment." },
    { n: 4, x: 7, y: 61, icon: Thermometer, title: "Cooling & Heating", text: "Overheating, coolant leaks, heater issues." },
    { n: 5, x: 93, y: 76, icon: Wind, title: "Exhaust", text: "Loud exhaust, rattles and leaks." },
    { n: 6, x: 77, y: 71, icon: Disc, title: "Brakes & Wheels", text: "Pads, rotors, bearings and more." },
  ];
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
      <div className="relative mx-auto w-full max-w-2xl">
        <svg viewBox="0 0 400 170" className="w-full text-text/70" aria-hidden>
          <path
            d="M20 120 V96 Q22 84 40 80 L110 72 L160 34 Q172 26 196 26 H262 Q284 26 304 46 L330 72 L368 80 Q384 84 386 100 V120"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M168 72 L196 40 H258 Q276 40 290 56 L304 72 Z" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          <line x1="20" y1="120" x2="386" y2="120" stroke="currentColor" strokeWidth="3" />
          {[100, 308].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="120" r="28" fill="var(--color-surface)" stroke="currentColor" strokeWidth="3" />
              <circle cx={cx} cy="120" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            </g>
          ))}
        </svg>
        {areas.map((a) => (
          <span
            key={a.n}
            className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold font-display text-sm text-black shadow-[0_0_0_6px_rgb(245_197_24/0.25)]"
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
          >
            {a.n}
          </span>
        ))}
      </div>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {areas.map((a) => (
          <li key={a.n} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold font-display text-xs text-black">{a.n}</span>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-text">
                <a.icon className="size-4 text-gold-ink" /> {a.title}
              </p>
              <p className="text-xs text-muted">{a.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ───────── Detailing: package comparison ───────── */
function DetailPackages() {
  const features = [
    ["Vacuum & interior wipe-down", true, false, true],
    ["Seat & carpet shampoo", true, false, true],
    ["Leather clean & condition", true, false, true],
    ["Hand wash & dry", false, true, true],
    ["Clay bar decontamination", false, true, true],
    ["Wax or sealant protection", false, true, true],
    ["Wheels, tires & trim", false, true, true],
    ["Engine bay wipe-down", false, false, true],
  ] as const;
  const pkgs = ["Interior", "Exterior", "Full Detail"];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-sm">
        <thead>
          <tr>
            <th className="w-1/2 pb-4 text-left font-normal text-muted">What&apos;s included</th>
            {pkgs.map((p, i) => (
              <th key={p} className="pb-4">
                <span
                  className={`inline-flex flex-col items-center rounded-xl px-4 py-2 font-display uppercase ${i === 2 ? "bg-gold text-black" : "bg-surface-2 text-text"}`}
                >
                  <Sparkles className="mb-1 size-4" />
                  {p}
                  {i === 2 && <span className="mt-0.5 font-sans text-[0.6rem] font-bold tracking-wider">MOST POPULAR</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {features.map(([label, ...has]) => (
            <tr key={label}>
              <td className="py-3 text-text/90">{label}</td>
              {has.map((h, i) => (
                <td key={i} className={`py-3 text-center ${i === 2 ? "bg-gold/5" : ""}`}>
                  {h ? <Check className="mx-auto size-5 text-gold-ink" /> : <X className="mx-auto size-4 text-subtle/60" />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const INFOGRAPHICS: Record<Exclude<Infographic, "buying-journey">, { eyebrow: string; title: React.ReactNode; note?: string; Body: () => React.ReactNode }> = {
  "trade-value": {
    eyebrow: "Know Your Value",
    title: (
      <>
        What Shapes Your <span className="text-gold-grad">Offer</span>
      </>
    ),
    Body: TradeValue,
  },
  "maintenance-schedule": {
    eyebrow: "Maintenance Guide",
    title: (
      <>
        Typical Service <span className="text-gold-grad">Intervals</span>
      </>
    ),
    note: "General guide only. Intervals vary by vehicle, oil type and driving conditions. Always follow your owner's manual.",
    Body: MaintenanceSchedule,
  },
  "brake-signs": {
    eyebrow: "Know The Signs",
    title: (
      <>
        Is It Time For <span className="text-gold-grad">Brakes?</span>
      </>
    ),
    Body: BrakeSigns,
  },
  "tire-tread": {
    eyebrow: "Tire Guide",
    title: (
      <>
        How Much Tread <span className="text-gold-grad">Is Left?</span>
      </>
    ),
    Body: TireTread,
  },
  "repair-areas": {
    eyebrow: "What We Fix",
    title: (
      <>
        Bumper To <span className="text-gold-grad">Bumper</span>
      </>
    ),
    Body: RepairAreas,
  },
  "detail-packages": {
    eyebrow: "Compare Packages",
    title: (
      <>
        Pick Your <span className="text-gold-grad">Detail</span>
      </>
    ),
    note: "Ask us about add-ons like headlight restoration. Pricing depends on vehicle size and condition.",
    Body: DetailPackages,
  },
};

export function ServiceInfographic({ kind, bodyCounts }: { kind: Infographic; bodyCounts: Record<string, number> }) {
  if (kind === "buying-journey") {
    return (
      <Frame
        eyebrow="Shop By Style"
        title={
          <>
            What Are You <span className="text-gold-grad">Looking For?</span>
          </>
        }
      >
        <BodyStyleShop counts={bodyCounts} />
      </Frame>
    );
  }
  const { Body, ...frame } = INFOGRAPHICS[kind];
  return (
    <Frame {...frame}>
      <Body />
    </Frame>
  );
}

/* ───────── Home / services: the full journey with Empire ───────── */
export function JourneyCycle() {
  const steps = [
    { icon: CarFront, title: "Find Your Car" },
    { icon: BadgeDollarSign, title: "Financing Paperwork" },
    { icon: KeyRound, title: "Drive Home" },
    { icon: Wrench, title: "Keep It Maintained" },
    { icon: Sparkles, title: "Keep It Shining" },
    { icon: Repeat, title: "Trade Up" },
  ];
  return (
    <div className="relative">
      {/* Desktop: ring */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[34rem] md:block">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#d9a400" />
            </marker>
          </defs>
          <circle cx="50" cy="50" r="38" fill="none" stroke="#f5c518" strokeOpacity="0.35" strokeWidth="0.6" strokeDasharray="1.5 1.8" />
          {steps.map((_, i) => {
            const a1 = ((i * 60 + 18 - 90) * Math.PI) / 180;
            const a2 = ((i * 60 + 42 - 90) * Math.PI) / 180;
            const p = (a: number) => `${(50 + 38 * Math.cos(a)).toFixed(2)} ${(50 + 38 * Math.sin(a)).toFixed(2)}`;
            return <path key={i} d={`M${p(a1)} A38 38 0 0 1 ${p(a2)}`} fill="none" stroke="#d9a400" strokeWidth="0.8" markerEnd="url(#arrow)" />;
          })}
        </svg>
        <div className="absolute inset-[26%] flex flex-col items-center justify-center rounded-full bg-black p-4 text-center shadow-[0_20px_60px_-20px_rgb(0_0_0/0.5)]">
          <span className="font-display text-xs uppercase tracking-[0.25em] text-gold">Empire</span>
          <span className="mt-1 font-display text-lg uppercase leading-tight text-white">Your Car,
            <br />
            Start To Finish</span>
        </div>
        {steps.map((s, i) => {
          const a = ((i * 60 - 90) * Math.PI) / 180;
          return (
            <div
              key={s.title}
              className="group absolute flex w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
              style={{ left: `${50 + 38 * Math.cos(a)}%`, top: `${50 + 38 * Math.sin(a)}%` }}
            >
              <span className="flex size-14 items-center justify-center rounded-full border-2 border-gold bg-surface text-gold-ink shadow-[0_8px_24px_-10px_rgb(0_0_0/0.3)] transition">
                <s.icon className="size-6" />
              </span>
              <span className="mt-2 rounded-full bg-surface/90 px-2 py-0.5 text-xs font-semibold text-text">
                {i + 1}. {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical steps */}
      <ol className="relative space-y-4 border-l-2 border-dashed border-gold/50 pl-6 md:hidden">
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            <span className="absolute -left-[2.35rem] flex size-8 items-center justify-center rounded-full border-2 border-gold bg-surface text-gold-ink">
              <s.icon className="size-4" />
            </span>
            <span className="font-display text-sm uppercase text-text">
              {i + 1}. {s.title}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ───────── Numbered process timeline ───────── */
export function ProcessSteps({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className={`relative grid gap-8 md:gap-4 ${steps.length === 5 ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
      <span className="absolute left-5 top-5 hidden h-0.5 bg-gradient-to-r from-gold via-gold/60 to-gold/20 md:block" style={{ right: `${100 / steps.length / 2}%`, left: `${100 / steps.length / 2}%` }} />
      <span className="absolute bottom-5 left-5 top-5 w-0.5 bg-gradient-to-b from-gold to-gold/20 md:hidden" />
      {steps.map((s, i) => (
        <li key={`${i}-${s.title}`} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
          <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold-deep font-display text-black shadow-[0_0_0_6px_var(--color-ink)]">
            {i + 1}
          </span>
          <div>
            <p className="font-display text-base uppercase text-text">{s.title}</p>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
