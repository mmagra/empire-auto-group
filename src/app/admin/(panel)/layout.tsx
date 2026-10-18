import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { site } from "@/config/site";
import { logout } from "../actions";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s | ${site.name} Admin` },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const newLeads = await db.lead.count({ where: { status: "NEW" } });

  return (
    <div className="min-h-dvh bg-ink lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Sidebar stays black so the chrome + gold logo looks right; pages are light. */}
      <aside className="dark-zone sticky top-0 z-30 flex flex-col border-b border-line bg-black lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:px-5 lg:py-6">
          <Link href="/admin">
            <Image src="/brand/logo-full.webp" alt={site.legalName} width={1400} height={727} className="h-12 w-auto lg:h-auto lg:w-44" />
          </Link>
          <p className="hidden text-[0.65rem] uppercase tracking-[0.25em] text-subtle lg:mt-2 lg:block">Dealer Admin</p>
          <form action={logout} className="lg:hidden">
            <button className="btn btn-ghost btn-sm" aria-label="Sign out">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
        <AdminNav newLeads={newLeads} />
        <div className="mt-auto hidden border-t border-line p-4 lg:block">
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:text-gold-ink">
            <ExternalLink className="size-4" /> View website
          </Link>
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">{user.name}</p>
              <p className="truncate text-xs text-subtle">{user.email}</p>
            </div>
            <form action={logout}>
              <button className="text-muted hover:text-gold-ink" aria-label="Sign out" title="Sign out">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
