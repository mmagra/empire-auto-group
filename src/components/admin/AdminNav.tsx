"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, Inbox, LayoutDashboard, Settings } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/vehicles", label: "Vehicles", icon: CarFront },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({ newLeads }: { newLeads: number }) {
  const pathname = usePathname();
  // "Vehicles" stays highlighted on its sub-pages too (add / edit a vehicle).
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            active(href, exact) ? "bg-gold/10 text-gold-ink" : "text-text/75 hover:bg-surface-2 hover:text-text"
          }`}
        >
          <Icon className="size-4" />
          {label}
          {href === "/admin/leads" && newLeads > 0 && (
            <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[0.7rem] font-bold text-black">{newLeads}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
