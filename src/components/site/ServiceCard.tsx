import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { serviceBySlug, serviceHref } from "@/content/services";

/** Photo card linking to a service page (used here, on /services and on the home page). */
export function ServiceCard({ slug }: { slug: string }) {
  const s = serviceBySlug(slug)!;
  return (
    <Link href={serviceHref(s)} className="group card relative flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-gold/60">
      <div className="relative aspect-[3/2] overflow-hidden">
        <Image src={`${s.image}-sm.webp`} alt={s.imageAlt} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <span className="absolute bottom-3 left-3 flex size-10 items-center justify-center rounded-xl bg-gold text-black shadow-lg">
          <s.icon className="size-5" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg uppercase text-text">{s.name}</h3>
        <p className="mt-1 flex-1 text-sm text-muted">{s.short}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-ink">
          Learn more <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
