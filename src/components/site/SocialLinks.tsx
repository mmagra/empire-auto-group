import { site } from "@/config/site";

const ICONS = {
  facebook: (
    <path d="M14 8h3V4h-3c-2.8 0-4.5 1.9-4.5 4.7V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.9c0-.6.4-.9 1-.9Z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" />
    </>
  ),
  google: (
    <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3ZM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Zm-5.6-8a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9.1L6.4 14ZM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6Z" />
  ),
};

export function SocialLinks({ className = "" }: { className?: string }) {
  const links = (Object.keys(ICONS) as (keyof typeof ICONS)[]).filter((k) => site.social[k]);
  if (!links.length) return null;
  return (
    <div className={`flex gap-3 ${className}`}>
      {links.map((k) => (
        <a
          key={k}
          href={site.social[k]}
          target="_blank"
          rel="noopener"
          aria-label={k}
          className="inline-flex size-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-gold hover:text-gold-ink"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
            {ICONS[k]}
          </svg>
        </a>
      ))}
    </div>
  );
}
