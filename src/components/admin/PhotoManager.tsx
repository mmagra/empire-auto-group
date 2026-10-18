"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import { deletePhoto, reorderPhotos, uploadPhoto } from "@/app/admin/actions";

type Item = { id: string; url: string; file?: File };

type Common = {
  /** Called with the photo URLs (main first) whenever they change, e.g. for a live preview. */
  onPhotosChange?: (urls: string[]) => void;
};

type Props = Common &
  (
    | /** Saved vehicle: changes go straight to the server. */ { vehicleId: string; photos: { id: string; url: string }[]; onQueueChange?: never }
    | /** New vehicle: photos wait here and the form uploads them after saving. */ { vehicleId?: undefined; photos?: undefined; onQueueChange: (files: File[]) => void }
  );

const isImage = (f: File) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name);

/**
 * Photo grid for a vehicle. Every photo is the same size; the first one is the
 * main photo (gold frame + badge). Drag to reorder, ★ to make main, ← → to nudge.
 * Renders without its own card so the form can place it in a numbered section.
 */
export function PhotoManager(props: Props) {
  const router = useRouter();
  const saved = props.vehicleId !== undefined;
  const serverPhotos = props.photos ?? [];

  const [items, setItems] = useState<Item[]>(serverPhotos);
  // Re-sync with the server list after refreshes, without remounting (keeps error messages visible).
  const serverKey = serverPhotos.map((p) => p.id).join();
  const [prevKey, setPrevKey] = useState(serverKey);
  if (saved && serverKey !== prevKey) {
    setPrevKey(serverKey);
    setItems(serverPhotos);
  }

  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const { onPhotosChange } = props;
  const urlKey = items.map((i) => i.url).join("|");
  useEffect(() => {
    onPhotosChange?.(urlKey ? urlKey.split("|") : []);
  }, [urlKey, onPhotosChange]);

  // Free preview URLs of queued files when the page closes.
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  function commitQueue(next: Item[]) {
    setItems(next);
    props.onQueueChange?.(next.map((i) => i.file).filter((f): f is File => !!f));
  }

  async function addFiles(fileList: FileList | File[]) {
    const files = [...fileList].filter(isImage);
    if (!files.length) return;
    setErrors([]);

    if (!saved) {
      const added = files.map((file) => {
        const url = URL.createObjectURL(file);
        previews.current.add(url);
        return { id: url, url, file };
      });
      commitQueue([...items, ...added]);
      return;
    }

    // One request per file keeps uploads small and shows real progress.
    setUploading({ done: 0, total: files.length });
    const failed: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append("file", files[i]);
      try {
        const res = await uploadPhoto(props.vehicleId!, fd);
        if (!res.ok) failed.push(res.message ?? `${files[i].name} failed.`);
      } catch {
        failed.push(`${files[i].name}: upload failed (file too large or connection lost).`);
      }
      setUploading({ done: i + 1, total: files.length });
    }
    setUploading(null);
    setErrors(failed);
    router.refresh();
  }

  function applyOrder(next: Item[]) {
    if (!saved) return commitQueue(next);
    setItems(next);
    startTransition(async () => {
      await reorderPhotos(
        props.vehicleId!,
        next.map((p) => p.id),
      );
      router.refresh();
    });
  }

  const move = (id: string, delta: number) => {
    const i = items.findIndex((p) => p.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    applyOrder(next);
  };

  const makeMain = (id: string) => {
    const item = items.find((p) => p.id === id);
    if (item) applyOrder([item, ...items.filter((p) => p.id !== id)]);
  };

  const dropOn = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const dragged = items.find((p) => p.id === dragId)!;
    const next = items.filter((p) => p.id !== dragId);
    next.splice(
      next.findIndex((p) => p.id === targetId),
      0,
      dragged,
    );
    setDragId(null);
    applyOrder(next);
  };

  const remove = (id: string) => {
    if (!confirm("Remove this photo?")) return;
    if (!saved) {
      URL.revokeObjectURL(id);
      previews.current.delete(id);
      return commitQueue(items.filter((p) => p.id !== id));
    }
    setItems((ps) => ps.filter((p) => p.id !== id));
    startTransition(async () => {
      await deletePhoto(id);
      router.refresh();
    });
  };

  const iconBtn = "rounded-md bg-black/65 p-1.5 text-white backdrop-blur transition hover:bg-gold hover:text-black disabled:opacity-30";

  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDropActive(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropActive(false);
      }}
      onDrop={(e) => {
        setDropActive(false);
        if (e.dataTransfer.files.length) {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }
      }}
    >
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {uploading && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-surface-2 px-4 py-3 text-sm">
          <LoaderCircle className="size-4 animate-spin text-gold-ink" />
          Uploading {Math.min(uploading.done + 1, uploading.total)} of {uploading.total}…
          <div className="ml-auto h-1.5 w-32 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-gold transition-all" style={{ width: `${(uploading.done / uploading.total) * 100}%` }} />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
            dropActive ? "border-gold bg-gold/5 text-gold-ink" : "border-line bg-surface-2 text-muted hover:border-gold hover:text-gold-ink"
          }`}
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold-ink">
            <ImagePlus className="size-6" />
          </span>
          <span className="font-semibold text-text">Drop photos here or click to choose</span>
          <span className="text-xs text-subtle">Pick several at once. The first one becomes the main photo. JPG, PNG or WebP, up to 15 MB each.</span>
        </button>
      ) : (
        <ul className={`grid grid-cols-2 gap-3 rounded-xl transition sm:grid-cols-3 lg:grid-cols-4 ${dropActive ? "ring-2 ring-gold ring-offset-4 ring-offset-surface" : ""}`}>
          {items.map((p, i) => (
            <li
              key={p.id}
              draggable
              onDragStart={(e) => {
                setDragId(p.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => {
                if (dragId) e.preventDefault();
              }}
              onDrop={(e) => {
                if (!dragId) return;
                e.preventDefault();
                e.stopPropagation();
                dropOn(p.id);
              }}
              className={`group relative aspect-[4/3] cursor-grab overflow-hidden rounded-xl bg-black active:cursor-grabbing ${
                i === 0 ? "ring-[3px] ring-gold" : "ring-1 ring-line"
              } ${dragId === p.id ? "opacity-40" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={i === 0 ? "Main photo" : `Photo ${i + 1}`} className="h-full w-full object-cover" draggable={false} />
              <span
                className={`absolute left-2 top-2 flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase ${
                  i === 0 ? "bg-gold text-black" : "bg-black/60 text-white"
                }`}
              >
                {i === 0 ? (
                  <>
                    <Star className="size-3 fill-black" /> Main
                  </>
                ) : (
                  i + 1
                )}
              </span>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/85 to-transparent p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                {i === 0 ? (
                  <span className="px-1 text-[0.65rem] font-semibold text-white/90">Shown first</span>
                ) : (
                  <button type="button" title="Make main photo" aria-label="Make main photo" onClick={() => makeMain(p.id)} className={iconBtn}>
                    <Star className="size-3.5" />
                  </button>
                )}
                <span className="flex gap-1">
                  <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => move(p.id, -1)} className={iconBtn}>
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button type="button" aria-label="Move later" disabled={i === items.length - 1} onClick={() => move(p.id, 1)} className={iconBtn}>
                    <ChevronRight className="size-3.5" />
                  </button>
                  <button type="button" aria-label="Remove photo" onClick={() => remove(p.id)} className={`${iconBtn} hover:!bg-danger hover:!text-white`}>
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              </div>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={!!uploading}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line text-muted transition hover:border-gold hover:bg-gold/5 hover:text-gold-ink"
            >
              <ImagePlus className="size-6" />
              <span className="text-sm font-semibold">Add photos</span>
            </button>
          </li>
        </ul>
      )}

      {!saved && items.length > 0 && <p className="mt-3 text-xs text-muted">These photos upload when you press &ldquo;Create Vehicle&rdquo;.</p>}

      {errors.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-danger" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
