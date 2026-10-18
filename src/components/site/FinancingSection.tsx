import Link from "next/link";
import { BadgeCheck, Phone } from "lucide-react";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";

const BRING = ["Valid driver's license", "Proof of income (recent pay stubs)", "Proof of residence (utility bill)", "Proof of insurance", "Trade-in title or payoff info, if trading"];

export function FinancingSection() {
  return (
    <section id="financing" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute -right-40 top-10 size-[36rem] rounded-full bg-gold/10 blur-[120px]" />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <p className="eyebrow">Financing Paperwork</p>
          <h2 className="text-chrome mt-4 font-display text-3xl uppercase leading-[1.05] sm:text-4xl lg:text-5xl">
            We Help With <span className="text-gold-grad">The Paperwork</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Financing a car shouldn&apos;t be confusing. Whether it&apos;s your first car or your fifth, we&apos;ll sit down with you, explain each form
            and help you get the paperwork done right.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="card relative p-8 sm:p-10">
            <div className="gold-rule absolute inset-x-8 top-0" />
            <h3 className="font-display text-xl uppercase text-text">What to bring</h3>
            <p className="mt-2 text-sm text-muted">Having these ready makes the process quick and easy.</p>
            <ul className="mt-6 space-y-3">
              {BRING.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-text/90">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-gold-ink" /> {b}
                </li>
              ))}
            </ul>
            <div className="gold-rule my-8 opacity-40" />
            <p className="text-sm text-muted">Questions about financing? Talk to a real person.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a href={site.phoneHref} className="btn btn-gold flex-1">
                <Phone className="size-4" /> {site.phone}
              </a>
              <Link href="/contact?topic=financing" className="btn btn-ghost flex-1">
                Send a Message
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
