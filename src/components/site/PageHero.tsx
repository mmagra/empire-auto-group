/** Compact banner at the top of inner pages. */
export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: React.ReactNode; intro?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-surface-2 to-ink pb-14 pt-[calc(var(--header-h)+3.5rem)] sm:pb-16 sm:pt-[calc(var(--header-h)+4.5rem)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgb(245_197_24/0.18),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(23_23_28/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(23_23_28/0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="container-x relative text-center">
        <p className="eyebrow animate-fade-up">{eyebrow}</p>
        <h1 className="text-chrome mx-auto mt-4 max-w-4xl animate-fade-up font-display text-4xl uppercase leading-[1.02] [animation-delay:80ms] sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {intro && <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base text-muted [animation-delay:160ms] sm:text-lg">{intro}</p>}
        {children && <div className="mt-8 animate-fade-up [animation-delay:240ms]">{children}</div>}
      </div>
    </section>
  );
}
