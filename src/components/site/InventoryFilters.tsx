"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { SORTS } from "@/lib/constants";
import { Select } from "@/components/ui/Select";

type Facets = {
  makes: string[];
  modelsByMake: Record<string, string[]>;
  bodies: string[];
  minYear?: number;
  maxYear?: number;
};

const PRICES = [5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000];
const MILES = [25000, 50000, 75000, 100000, 125000, 150000];

export function InventoryFilters({ facets, total, children }: { facets: Facets; total: number; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  // Keyword box: local while typing, re-synced when the URL's q changes (back/forward, clear all).
  const urlQ = params.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setQ(urlQ);
  }

  const get = (k: string) => params.get(k) ?? "";
  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  const make = get("make");
  const models = make ? facets.modelsByMake[make] ?? [] : [];
  const years: number[] = [];
  if (facets.minYear && facets.maxYear) for (let y = facets.maxYear; y >= facets.minYear; y--) years.push(y);

  const activeCount = ["make", "model", "body", "minYear", "maxYear", "minPrice", "maxPrice", "maxMiles", "q"].filter((k) => params.get(k)).length;

  const select = (name: string, label: string, options: { value: string | number; label: string }[], extra?: Record<string, string>) => (
    <div>
      <label className="label" htmlFor={`f-${name}`}>
        {label}
      </label>
      <Select id={`f-${name}`} value={get(name)} onChange={(v) => update({ [name]: v, ...extra })} options={[{ value: "", label: "Any" }, ...options]} />
    </div>
  );

  const panel = (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q.trim() });
        }}
      >
        <label className="label" htmlFor="f-q">
          Keyword
        </label>
        <div className="relative">
          <input id="f-q" className="input pr-10" placeholder="e.g. Accord, AWD, red" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="submit" aria-label="Search" className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-gold-ink">
            <Search className="size-4" />
          </button>
        </div>
      </form>
      {select("make", "Make", facets.makes.map((m) => ({ value: m, label: m })), { model: "" })}
      {make && models.length > 0 && select("model", "Model", models.map((m) => ({ value: m, label: m })))}
      {facets.bodies.length > 0 && select("body", "Body style", facets.bodies.map((b) => ({ value: b, label: b })))}
      <div className="grid grid-cols-2 gap-3">
        {select("minYear", "Year from", years.map((y) => ({ value: y, label: String(y) })))}
        {select("maxYear", "Year to", years.map((y) => ({ value: y, label: String(y) })))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {select("minPrice", "Min price", PRICES.map((p) => ({ value: p, label: `$${p.toLocaleString()}` })))}
        {select("maxPrice", "Max price", PRICES.map((p) => ({ value: p, label: `$${p.toLocaleString()}` })))}
      </div>
      {select("maxMiles", "Max mileage", MILES.map((m) => ({ value: m, label: `${m.toLocaleString()} mi` })))}
      {activeCount > 0 && (
        <button
          type="button"
          className="btn btn-ghost btn-sm w-full"
          onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
        >
          <X className="size-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
      <aside className="card hidden self-start p-6 lg:sticky lg:top-24 lg:block" aria-label="Filters">
        <h2 className="mb-5 font-display text-sm uppercase tracking-[0.2em] text-gold-ink">Filter Inventory</h2>
        {panel}
      </aside>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-muted">
            {pending && <LoaderCircle className="size-4 animate-spin text-gold-ink" />}
            <span>
              <span className="font-semibold text-text">{total}</span> vehicle{total === 1 ? "" : "s"} found
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-ghost btn-sm lg:hidden" onClick={() => setOpen(true)}>
              <SlidersHorizontal className="size-4" /> Filters{activeCount ? ` (${activeCount})` : ""}
            </button>
            <Select
              id="f-sort"
              aria-label="Sort by"
              size="sm"
              className="w-52"
              value={get("sort") || "newest"}
              onChange={(v) => update({ sort: v === "newest" ? "" : v })}
              options={Object.entries(SORTS).map(([k, label]) => ({ value: k, label }))}
            />
          </div>
        </div>
        <div className={`transition-opacity ${pending ? "opacity-50" : ""}`}>{children}</div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[min(24rem,100%)] flex-col bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold-ink">Filters</h2>
              <button type="button" aria-label="Close filters" className="text-muted hover:text-text" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{panel}</div>
            <div className="border-t border-line p-4">
              <button type="button" className="btn btn-gold w-full" onClick={() => setOpen(false)}>
                Show {total} result{total === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
