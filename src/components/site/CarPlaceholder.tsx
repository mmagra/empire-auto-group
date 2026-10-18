/** Shown when a vehicle has no photos yet. Echoes the logo's car swoosh. */
export function CarPlaceholder({ label = "Photos coming soon", className = "" }: { label?: string; className?: string }) {
  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-[radial-gradient(ellipse_at_50%_120%,var(--color-surface-3)_0%,var(--color-surface-2)_55%,var(--color-surface)_100%)] ${className}`}
    >
      <svg viewBox="0 0 240 70" className="w-1/2 max-w-48" aria-hidden>
        <defs>
          <linearGradient id="ph-gold" x1="0" x2="1">
            <stop offset="0" stopColor="#f5c518" stopOpacity="0" />
            <stop offset="0.5" stopColor="#f5c518" />
            <stop offset="1" stopColor="#ffe066" />
          </linearGradient>
          <linearGradient id="ph-chrome" x1="0" x2="1">
            <stop offset="0" stopColor="#6b737d" />
            <stop offset="0.5" stopColor="#b8bfc7" />
            <stop offset="1" stopColor="#6b737d" />
          </linearGradient>
        </defs>
        <path d="M8 52 C 50 30, 95 22, 140 22 L 120 28 C 80 30, 45 40, 8 52 Z" fill="url(#ph-gold)" />
        <path d="M80 18 C 120 4, 170 2, 210 16 L 232 10 L 222 26 C 190 18, 150 16, 112 22 Z" fill="url(#ph-chrome)" opacity="0.9" />
        <path d="M70 58 C 120 44, 175 40, 228 44 L 214 50 C 170 48, 120 52, 70 58 Z" fill="url(#ph-chrome)" opacity="0.6" />
      </svg>
      <span className="font-display text-[0.7rem] uppercase tracking-[0.25em] text-subtle">{label}</span>
    </div>
  );
}
