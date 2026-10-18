/** Simple side-view silhouettes for "shop by body style". */
const BODIES: Record<string, string> = {
  Sedan: "M6 30 V24 Q7 20 16 19 L30 18 L40 10 Q44 7 52 7 H64 Q70 7 76 13 L81 18 L88 20 Q92 21 92 25 V30",
  SUV: "M6 30 V19 Q6 16 10 15 L20 14 L28 6 Q30 5 34 5 H74 Q80 5 82 9 L86 15 Q92 16 92 21 V30",
  Truck: "M6 30 V19 H46 V9 Q46 7 49 7 H62 Q66 7 69 11 L74 17 H86 Q92 18 92 22 V30 M46 19 H6",
  Coupe: "M6 30 V25 Q8 21 18 20 L34 19 L46 11 Q50 9 58 9 L66 10 Q72 12 80 19 L88 21 Q92 22 92 26 V30",
  Hatchback: "M8 30 V22 Q9 19 18 18 L32 17 L42 9 Q44 7 50 7 H70 Q76 7 80 14 L84 20 Q86 23 86 30",
  Minivan: "M6 30 V17 Q6 14 10 12 L24 6 Q26 5 30 5 H80 Q86 5 88 9 L91 17 Q92 19 92 23 V30",
  Wagon: "M6 30 V23 Q7 20 16 19 L30 18 L38 9 Q41 7 48 7 H84 Q88 7 89 11 L91 20 Q92 22 92 25 V30",
  Convertible: "M6 30 V24 Q7 20 16 19 L36 18 L42 13 L46 18 H80 L88 20 Q92 21 92 25 V30",
  Van: "M6 30 V12 Q6 6 12 6 H78 Q84 6 87 11 L91 18 Q92 20 92 24 V30",
};

export function BodyStyleIcon({ style, className = "" }: { style: string; className?: string }) {
  const d = BODIES[style] ?? BODIES.Sedan;
  return (
    <svg viewBox="0 0 98 40" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
      <path d="M6 30 H92" />
      {[24, 74].map((cx) => (
        <circle key={cx} cx={cx} cy="30" r="6.5" fill="var(--color-surface)" />
      ))}
    </svg>
  );
}
