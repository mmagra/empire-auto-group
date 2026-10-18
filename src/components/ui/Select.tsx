"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = string | { value: string | number; label: string; disabled?: boolean };

type Props = {
  options: SelectOption[];
  /** Controlled value. Omit and use defaultValue for an uncontrolled field inside a form. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Submitted with the form under this name (via a hidden input). */
  name?: string;
  id?: string;
  /** Shown when the value matches no option. */
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
};

type Opt = { value: string; label: string; disabled?: boolean };
const norm = (o: SelectOption): Opt => (typeof o === "string" ? { value: o, label: o } : { value: String(o.value), label: o.label, disabled: o.disabled });

const PANEL_MAX = 288; // px, matches max-h-72

/**
 * Styled replacement for <select>: a button that opens a listbox panel.
 * Keyboard: ↑ ↓ Home End to move, Enter/Space to pick, Esc to close, type a letter to jump.
 * The panel renders in a portal so it is never clipped by scrolling containers or tables.
 */
export function Select({
  options: raw,
  value: controlled,
  defaultValue = "",
  onChange,
  name,
  id,
  placeholder = "Select",
  required,
  disabled,
  size = "md",
  className = "",
  ...aria
}: Props) {
  const options = useMemo(() => raw.map(norm), [raw]);
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ?? inner;
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState(false); // required but empty on submit
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number; dark: boolean } | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const autoId = useId();
  const listId = `${id ?? autoId}-list`;

  const place = useCallback(() => {
    const el = button.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const up = below < Math.min(PANEL_MAX, options.length * 40 + 16) + 12 && r.top > below;
    setPos({
      left: r.left,
      width: r.width,
      ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
      dark: Boolean(el.closest(".dark-zone")),
    });
  }, [options.length]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!button.current?.contains(t) && !list.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep the highlighted option visible.
  useEffect(() => {
    if (open && active >= 0) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    if (disabled) return;
    setActive(selectedIndex >= 0 ? selectedIndex : options.findIndex((o) => !o.disabled));
    setOpen(true);
  };

  const choose = (i: number) => {
    const o = options[i];
    if (!o || o.disabled) return;
    if (controlled === undefined) setInner(o.value);
    setInvalid(false);
    if (o.value !== value) onChange?.(o.value);
    setOpen(false);
    button.current?.focus();
  };

  const step = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < options.length; i += dir) if (!options[i].disabled) return i;
    return from;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => step(a, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => step(a, -1));
        break;
      case "Home":
        e.preventDefault();
        setActive(step(-1, 1));
        break;
      case "End":
        e.preventDefault();
        setActive(step(options.length, -1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const now = Date.now();
          typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : "") + e.key.toLowerCase(), at: now };
          const i = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(typed.current.text));
          if (i >= 0) setActive(i);
        }
    }
  };

  const isEmpty = !selected || selected.value === "";
  const h = size === "sm" ? "py-2 pl-3 pr-9 text-sm" : "py-[0.7rem] pl-[0.85rem] pr-10";

  return (
    <div className={`relative ${className}`}>
      <button
        ref={button}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`input relative flex w-full items-center text-left disabled:cursor-not-allowed disabled:opacity-60 ${h} ${
          open ? "border-gold shadow-[0_0_0_3px_rgb(245_197_24/0.15)]" : invalid ? "border-danger" : "hover:border-gold/60"
        }`}
        {...aria}
      >
        <span className={`block truncate ${isEmpty ? "text-subtle" : "text-text"}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted transition-transform duration-200 ${open ? "rotate-180 text-gold-ink" : ""}`} />
      </button>

      {/* Carries the value into forms; visually hidden but still validated when required */}
      {name !== undefined && (
        <input
          tabIndex={-1}
          aria-hidden
          name={name}
          value={value}
          required={required}
          onChange={() => {}}
          onInvalid={(e) => {
            // Show our own message on the visible field instead of the browser bubble on this hidden one.
            e.preventDefault();
            setInvalid(true);
            button.current?.focus();
          }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
        />
      )}

      {invalid && <p className="mt-1 text-xs text-danger">Please choose an option.</p>}

      {/* Only ever rendered after a click, so document is always available here */}
      {open &&
        pos &&
        createPortal(
          <ul
            ref={list}
            id={listId}
            role="listbox"
            aria-labelledby={id}
            className={`${pos.dark ? "dark-zone" : ""} animate-pop fixed z-[80] max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface p-1.5 shadow-[0_24px_48px_-16px_rgb(0_0_0/0.35),0_2px_6px_rgb(0_0_0/0.06)]`}
            style={{ left: pos.left, width: Math.max(pos.width, 176), top: pos.top, bottom: pos.bottom, transformOrigin: pos.top !== undefined ? "top" : "bottom" }}
          >
            {options.map((o, i) => {
              const isSel = i === selectedIndex;
              return (
                <li
                  key={`${o.value}-${i}`}
                  id={`${listId}-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={o.disabled}
                  onMouseEnter={() => !o.disabled && setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                  className={`flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    o.disabled ? "cursor-default text-subtle" : i === active ? "bg-gold/15 text-text" : "text-text/85"
                  } ${isSel ? "font-semibold" : ""}`}
                >
                  <span className={`truncate ${o.value === "" ? "text-muted" : ""}`}>{o.label}</span>
                  {isSel && <Check className="size-4 shrink-0 text-gold-ink" />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
