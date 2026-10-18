"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { CarPlaceholder } from "./CarPlaceholder";

type Photo = { lg: string; sm: string };

export function Gallery({ photos, title }: { photos: Photo[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchX = useRef<number | null>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const count = photos.length;

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  useEffect(() => {
    thumbs.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

  if (!count) {
    return (
      <div className="card aspect-[4/3] overflow-hidden">
        <CarPlaceholder />
      </div>
    );
  }

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current == null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touchX.current = null;
    },
  };

  const arrows = (big = false) =>
    count > 1 && (
      <>
        <button
          type="button"
          aria-label="Previous photo"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          className={`absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-gold hover:text-black ${big ? "size-12" : "size-10"}`}
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          className={`absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-gold hover:text-black ${big ? "size-12" : "size-10"}`}
        >
          <ChevronRight className="size-5" />
        </button>
      </>
    );

  return (
    <div>
      <div className="group card relative aspect-[4/3] overflow-hidden bg-black" {...swipe}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[index].lg}
          alt={`${title}, photo ${index + 1} of ${count}`}
          className="h-full w-full cursor-zoom-in object-cover"
          onClick={() => setLightbox(true)}
          fetchPriority={index === 0 ? "high" : "auto"}
        />
        {arrows()}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-gold hover:text-black"
        >
          <Expand className="size-3.5" /> {index + 1} / {count}
        </button>
      </div>

      {count > 1 && (
        <div ref={thumbs} className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p.sm}
              data-i={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border-2 transition sm:w-28 ${
                i === index ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.sm} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setLightbox(false)} {...swipe}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[index].lg}
            alt={`${title}, photo ${index + 1} of ${count}`}
            className="max-h-[90vh] max-w-[94vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {arrows(true)}
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-gold hover:text-black"
            onClick={() => setLightbox(false)}
          >
            <X className="size-5" />
          </button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/70">
            {index + 1} / {count}
          </p>
        </div>
      )}
    </div>
  );
}
