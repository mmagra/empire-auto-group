import Link from "next/link";
import { CarFront, Navigation, Phone } from "lucide-react";
import { site } from "@/config/site";

/** Sticky action bar on phones: the three things a dealership visitor wants. */
export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.15)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-3 text-xs font-semibold">
        <a href={site.phoneHref} className="flex flex-col items-center gap-1 py-3 text-gold-ink">
          <Phone className="size-5" /> Call
        </a>
        <Link href="/inventory" className="flex flex-col items-center gap-1 border-x border-line py-3 text-text">
          <CarFront className="size-5" /> Inventory
        </Link>
        <a href={site.mapsUrl} target="_blank" rel="noopener" className="flex flex-col items-center gap-1 py-3 text-text">
          <Navigation className="size-5" /> Directions
        </a>
      </div>
    </div>
  );
}
