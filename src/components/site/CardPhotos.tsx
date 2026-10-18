"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { CarPlaceholder } from "./CarPlaceholder";

/**
 * Photo area of an inventory card. With several photos, shoppers can flip
 * through them with the arrows (hover on desktop) or by swiping, without
 * leaving the listing page. The card itself stays a link to the vehicle.
 */
export function CardPhotos({ photos, title, priority = false }: { photos: string[]; title: string; priority?: boolean }) {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = photos.length;

  if (!n) return <CarPlaceholder />;

  const go = (e: React.MouseEvent, d: number) => {
    // Buttons sit inside the card's link: don't navigate.
    e.preventDefault();
    e.stopPropagation();
    setI((x) => (x + d + n) % n);
  };

  const arrow = "absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-gold hover:text-black sm:opacity-0 sm:group-hover:opacity-100";

  return (
    <div
      className="absolute inset-0"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null || n < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) setI((x) => (x + (dx < 0 ? 1 : -1) + n) % n);
        touchX.current = null;
      }}
    >
      <Image
        key={photos[i]}
        src={photos[i]}
        alt={`${title}, photo ${i + 1} of ${n}`}
        fill
        sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, (min-width:640px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority={priority && i === 0}
        unoptimized
      />
      {/* Preload the next photo so flipping feels instant */}
      {n > 1 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photos[(i + 1) % n]} alt="" aria-hidden className="hidden" />
      )}

      {n > 1 && (
        <>
          <button type="button" aria-label="Previous photo" onClick={(e) => go(e, -1)} className={`${arrow} left-2`}>
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" aria-label="Next photo" onClick={(e) => go(e, 1)} className={`${arrow} right-2`}>
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {photos.slice(0, 6).map((p, d) => (
              <span key={p} className={`h-1.5 rounded-full transition-all ${d === Math.min(i, 5) ? "w-4 bg-gold" : "w-1.5 bg-white/70"}`} />
            ))}
          </div>
          <span className="absolute bottom-2.5 right-3 z-10 flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[0.7rem] text-white">
            <Images className="size-3" /> {i + 1}/{n}
          </span>
        </>
      )}
    </div>
  );
}
