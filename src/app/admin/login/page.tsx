import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession, needsFirstAdmin } from "@/lib/auth";
import { site } from "@/config/site";
import { LoginForm, SetupForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin Sign In", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const setup = await needsFirstAdmin();
  if (!setup && (await getSession())) redirect("/admin");

  return (
    <main className="dark-zone relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgb(245_197_24/0.14),transparent_70%)]" />
      <div className="relative w-full max-w-sm">
        <Image src="/brand/logo-full.webp" alt={site.legalName} width={1400} height={727} priority className="mx-auto h-auto w-64" />
        <div className="card mt-8 p-7">
          {setup ? (
            <>
              <h1 className="font-display text-xl uppercase text-text">Welcome! Set Up Admin</h1>
              <p className="mb-6 mt-1 text-sm text-muted">Create the owner account. This screen only appears once, before any admin exists.</p>
              <SetupForm />
            </>
          ) : (
            <>
              <h1 className="font-display text-xl uppercase text-text">Dealer Sign In</h1>
              <p className="mb-6 mt-1 text-sm text-muted">Manage inventory and leads.</p>
              <LoginForm />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
