import { site } from "@/config/site";
import { formatTime } from "@/lib/format";

const label = (h: (typeof site.hours)[number]) => (h.open && h.close ? `${formatTime(h.open)} – ${formatTime(h.close)}` : "Closed");

/**
 * Opening hours from site.ts. `compact` groups consecutive days with the same
 * hours ("Mon – Fri  9 AM – 6 PM") for tight spaces.
 */
export function HoursList({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const rows: { days: string; time: string; closed: boolean }[] = [];
  if (compact) {
    for (const h of site.hours) {
      const time = label(h);
      const last = rows[rows.length - 1];
      const short = h.day.slice(0, 3);
      if (last && last.time === time) last.days = `${last.days.split(" – ")[0]} – ${short}`;
      else rows.push({ days: short, time, closed: !h.open });
    }
  } else {
    for (const h of site.hours) rows.push({ days: h.day, time: label(h), closed: !h.open });
  }

  return (
    <dl className={`space-y-2 ${className}`}>
      {rows.map((r) => (
        <div key={r.days} className="flex justify-between gap-6 border-b border-line/60 pb-2 last:border-0">
          <dt className="text-text/80">{r.days}</dt>
          <dd className={r.closed ? "text-subtle" : "text-text"}>{r.time}</dd>
        </div>
      ))}
    </dl>
  );
}
