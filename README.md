# Empire Auto Group

Website and inventory backend for **Empire Auto Group LLC**, 44 Manchester Road, Derry, NH 03038 · 603-858-8844.

Next.js 16 (App Router) · Tailwind CSS v4 · Prisma + SQLite · sharp for photos · deployed as a Node.js app on Hostinger Business Web Hosting. **No environment variables needed.**

## Run locally

```bash
npm install
npm run seed      # optional: demo cars + an admin login (password printed)
npm run dev       # http://localhost:3000, admin at /admin
```

Without `npm run seed`, the first visit to `/admin` shows a one-time "Set Up Admin" screen instead.
Remove demo cars with `npm run seed -- --clear`. Reset a password with
`npm run admin:create -- owner@example.com "Owner Name" "new-password-10+"`.

Local data (database + photos) lives in `./data/`. In production it lives in `~/empire-auto-group-data/`, outside the app folder (see `src/lib/paths.ts`).

## Where things live

| What | Where |
|---|---|
| Business name, phone, address, **hours**, social links, nav | `src/config/site.ts` |
| **Service pages** (text, FAQs, photos, which form + infographic each uses) | `src/content/services.ts` → pages at `/services/<slug>`, dropdown, footer |
| Infographics (maintenance chart, tire tread, brake signs, etc.) | `src/components/site/infographics.tsx` |
| Service photos (Pexels, free commercial use, checked for no logos) | `public/images/services/` |
| Light theme tokens, dark zones (header/hero/footer/admin), buttons | `src/app/globals.css` |
| Hero video (Pexels clip 29498827: CGI supercar, blank badge, free commercial use) | `public/video/`, `src/components/site/HeroVideo.tsx` |
| Logo variants, favicon, share image | `npm run brand` (source logo in `assets/brand-source/`) |
| Public pages | `src/app/(site)/` |
| Admin pages / server actions | `src/app/admin/(panel)/`, `src/app/admin/actions.ts` |
| Lead form handling (spam checks, email alert) | `src/app/actions/leads.ts` |
| Database schema | `prisma/schema.prisma` → run `npm run db:sql` after changing it |

## Hidden pages (work by direct link only)

These pages are not linked anywhere on the site, are left out of the sitemap and tell search engines not to list them (`hidden: true` in `src/content/services.ts`). Remove that flag to bring a page back.

| Page | URL |
|---|---|
| Car Sales | `/services/car-sales` |
| Financing Paperwork | `/services/financing` |
| Trade-In | `/services/trade-in` (also `/trade-in`) |

The home page keeps its Financing Paperwork and Trade-In sections; their buttons open the Contact form with the topic pre-selected (`/contact?topic=financing`, `/contact?topic=trade-in`).

## How "no environment variables" works

- **Database & photos:** path computed in `src/lib/paths.ts`. Tables are created automatically on first start (`src/lib/db.ts`).
- **Login security key:** generated on first use and stored in the database.
- **Site address** (sitemap, share links, emails): detected from each request.
- **Email (SMTP) settings & lead recipients:** entered in Admin → Settings.
- **First admin:** created on the one-time setup screen at `/admin`.

## Checks

```bash
npm run lint && npm run typecheck && npm run build
```

