import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";

type Crumb = { label: string; href?: string };

/** Visible breadcrumb trail plus BreadcrumbList structured data for search engines. */
export function Breadcrumbs({ items, baseUrl, className = "" }: { items: Crumb[]; baseUrl: string; className?: string }) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          {all.map((c, i) => (
            <li key={c.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5 text-subtle" />}
              {c.href && i < all.length - 1 ? (
                <Link href={c.href} className="hover:text-gold-ink">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-text">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: `${baseUrl}${c.href}` } : {}),
          })),
        }}
      />
    </>
  );
}
