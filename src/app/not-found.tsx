import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main">
    <section className="container-x flex min-h-[70vh] flex-col items-center justify-center pt-[var(--header-h)] text-center">
      <p className="eyebrow">404</p>
      <h1 className="text-chrome mt-4 font-display text-4xl uppercase sm:text-5xl">Wrong Turn</h1>
      <p className="mt-4 max-w-md text-muted">That page isn&apos;t here. The car you were looking at may have already found a new home.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/inventory" className="btn btn-gold">
          View Inventory <ArrowRight className="size-4" />
        </Link>
        <Link href="/" className="btn btn-ghost">
          Go Home
        </Link>
      </div>
    </section>
      </main>
      <Footer />
    </>
  );
}
