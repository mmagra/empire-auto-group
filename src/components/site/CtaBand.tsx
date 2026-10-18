import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { site } from "@/config/site";

/** Closing call-to-action shown above the footer on every public page. */
export function CtaBand() {
  return (
    <section className="container-x mt-24">
      <div className="dark-zone relative overflow-hidden rounded-3xl bg-black px-6 py-12 sm:px-12 lg:py-14">
        <div className="pointer-events-none absolute -right-20 -top-28 size-96 rounded-full bg-gold/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 size-72 rounded-full bg-gold/10 blur-3xl" />
        <svg className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-1/2 text-gold/15 lg:block" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
          <path d="M0 200 C 120 120, 260 90, 400 100 L400 200 Z" fill="currentColor" />
          <path d="M60 200 C 170 140, 290 120, 400 130" fill="none" stroke="#f5c518" strokeOpacity="0.5" strokeWidth="2" />
        </svg>
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="eyebrow">{site.tagline}</p>
            <h2 className="text-chrome mt-3 max-w-2xl font-display text-3xl uppercase leading-tight sm:text-4xl">
              Ready For Your <span className="text-gold-grad">Next Car?</span>
            </h2>
            <p className="mt-3 max-w-xl text-muted">Stop by Empire Auto Group in Derry, shop online, or give us a call. We&apos;re happy to help.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/inventory" className="btn btn-gold px-7">
              View Inventory <ArrowRight className="size-4" />
            </Link>
            <a href={site.phoneHref} className="btn btn-ghost px-7">
              <Phone className="size-4" /> {site.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
