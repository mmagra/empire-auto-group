"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { site } from "@/config/site";
import { SERVICE_GROUPS, VISIBLE_GROUPS, VISIBLE_SERVICES, serviceHref } from "@/content/services";

const GROUPS = VISIBLE_GROUPS;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile menu
  const [menu, setMenu] = useState(false); // desktop services dropdown
  const [mobileServices, setMobileServices] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the dropdown with Escape or a click outside it.
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    const onClick = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [menu]);

  const closeAll = () => {
    setOpen(false);
    setMenu(false);
  };
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const servicesActive = pathname.startsWith("/services");
  const overVideo = pathname === "/" && !scrolled && !open && !menu;

  const openMenu = () => {
    clearTimeout(closeTimer.current);
    setMenu(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMenu(false), 160);
  };

  const linkClass = (active: boolean) =>
    `relative flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-[0.08em] transition-colors hover:text-gold-ink ${
      active ? "text-gold-ink" : "text-text/90"
    }`;

  return (
    <header
      className={`dark-zone fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        overVideo ? "bg-gradient-to-b from-black/80 via-black/40 to-transparent" : "border-b border-gold/25 bg-black shadow-[0_8px_30px_-12px_rgb(0_0_0/0.6)]"
      }`}
    >
      <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-6">
        {/* Full logo exactly as supplied: swoosh, EMPIRE, AUTO GROUP, LLC and the slogan */}
        <Link href="/" className="shrink-0" aria-label={`${site.legalName}, home`} onClick={closeAll}>
          <Image
            src="/brand/logo-full.webp"
            alt={`${site.legalName}: ${site.tagline}`}
            width={1400}
            height={727}
            priority
            sizes="220px"
            className="h-[4.5rem] w-auto lg:h-[5.5rem]"
          />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {site.nav.map((item) =>
            item.href === "/services" ? (
              <div key={item.href} ref={menuRef} className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
                <button
                  type="button"
                  className={linkClass(servicesActive || menu)}
                  aria-expanded={menu}
                  aria-controls="services-menu"
                  onClick={() => setMenu((m) => !m)}
                >
                  {item.label}
                  <ChevronDown className={`size-4 transition-transform ${menu ? "rotate-180" : ""}`} />
                  {servicesActive && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded bg-gold" />}
                </button>

                {menu && (
                  <div id="services-menu" className={`absolute left-1/2 top-full -translate-x-1/2 pt-4 ${GROUPS.length > 1 ? "w-[46rem]" : "w-[32rem]"}`}>
                    <div className={`grid overflow-hidden rounded-2xl border border-gold/25 bg-black shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] ${GROUPS.length > 1 ? "grid-cols-[1fr_1fr_14rem]" : "grid-cols-[1fr_13rem]"}`}>
                      {GROUPS.map((g) => (
                        <div key={g} className="border-r border-line p-5">
                          <p className="px-2 font-display text-xs uppercase tracking-[0.2em] text-gold">{SERVICE_GROUPS[g].title}</p>
                          <ul className="mt-3 space-y-1">
                            {VISIBLE_SERVICES.filter((s) => s.group === g).map((s) => (
                              <li key={s.slug}>
                                <Link
                                  href={serviceHref(s)}
                                  onClick={closeAll}
                                  className={`group flex items-start gap-3 rounded-xl p-2 transition hover:bg-surface-2 ${pathname === serviceHref(s) ? "bg-surface-2" : ""}`}
                                >
                                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold transition group-hover:bg-gold group-hover:text-black">
                                    <s.icon className="size-4" />
                                  </span>
                                  <span>
                                    <span className="block text-sm font-semibold text-white">{s.name}</span>
                                    <span className="block text-xs leading-snug text-muted">{s.short}</span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="flex flex-col justify-between bg-gradient-to-b from-gold/15 to-transparent p-5">
                        <div>
                          <p className="font-display text-base uppercase leading-tight text-white">Need it done?</p>
                          <p className="mt-2 text-xs leading-relaxed text-muted">Book any service online or give us a call. We&apos;ll confirm your time.</p>
                        </div>
                        <div className="mt-5 space-y-2">
                          <Link href="/services#book" onClick={closeAll} className="btn btn-gold btn-sm w-full">
                            Book Service
                          </Link>
                          <Link href="/services" onClick={closeAll} className="flex items-center justify-center gap-1 text-xs font-semibold text-gold hover:underline">
                            All services <ArrowRight className="size-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.href} href={item.href} className={linkClass(isActive(item.href))} onClick={closeAll}>
                {item.label}
                {isActive(item.href) && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded bg-gold" />}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a href={site.phoneHref} className="btn btn-gold btn-sm hidden sm:inline-flex">
            <Phone className="size-4" /> {site.phone}
          </a>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg border border-line text-text lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-line bg-black px-4 pb-28 pt-4 lg:hidden" aria-label="Mobile">
          <ul className="space-y-1">
            {site.nav.map((item) =>
              item.href === "/services" ? (
                <li key={item.href}>
                  <button
                    type="button"
                    aria-expanded={mobileServices}
                    onClick={() => setMobileServices((v) => !v)}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-4 font-display text-lg uppercase tracking-wider ${
                      servicesActive ? "bg-surface-2 text-gold-ink" : "text-text"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className={`size-5 transition-transform ${mobileServices ? "rotate-180" : ""}`} />
                  </button>
                  {mobileServices && (
                    <div className="mb-2 ml-2 space-y-4 border-l border-gold/30 py-2 pl-4">
                      {GROUPS.map((g) => (
                        <div key={g}>
                          <p className="font-display text-xs uppercase tracking-[0.2em] text-gold">{SERVICE_GROUPS[g].title}</p>
                          <ul className="mt-1">
                            {VISIBLE_SERVICES.filter((s) => s.group === g).map((s) => (
                              <li key={s.slug}>
                                <Link href={serviceHref(s)} onClick={closeAll} className="flex items-center gap-3 py-2.5 text-text">
                                  <s.icon className="size-4 text-gold" /> {s.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <Link href="/services" onClick={closeAll} className="inline-flex items-center gap-1 text-sm font-semibold text-gold">
                        All services <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  )}
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeAll}
                    className={`flex items-center justify-between rounded-lg px-4 py-4 font-display text-lg uppercase tracking-wider ${
                      isActive(item.href) ? "bg-surface-2 text-gold-ink" : "text-text"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <div className="gold-rule my-6" />
          <a href={site.phoneHref} className="btn btn-gold w-full">
            <Phone className="size-4" /> Call {site.phone}
          </a>
        </nav>
      )}
    </header>
  );
}
