# Energy — Digital Menu

Bilingual (Arabic RTL / English) QR-code menu for **Energy**, a healthy-food restaurant.
Built with Next.js 14 (App Router), Tailwind CSS, NextAuth, Neon Postgres and Vercel Blob.

Live: https://energy-menu-v2.vercel.app

## Features

- Mobile-first public menu with category cards, search, item detail pages and a WhatsApp order button
- Arabic (RTL) / English toggle, dark / light theme (dark by default)
- Admin dashboard: categories, items (multi-image), hero banners, settings, QR code
- QR code page + print-ready `public/energy-menu-qr.png`
- Cart + checkout: add items from the cards, cart icon in the header (only when the cart has items), per-item notes,
  delivery address or restaurant pickup (optional arrival time), then the order is sent as a formatted WhatsApp message
  (Arabic or English, matching the selected language). Delivery fees are not shown. Orders are not stored in the database.

## Tech stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Framework| Next.js 14 (App Router), TypeScript          |
| Styling  | Tailwind CSS, framer-motion                  |
| Database | Neon Postgres (`@neondatabase/serverless`)   |
| Auth     | NextAuth v4 (credentials, JWT)               |
| Images   | Vercel Blob (uploads), Unsplash (seed photos)|
| QR       | qrcode.react, qrcode + sharp (print file)    |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run seed:db              # creates tables + loads the Energy menu (idempotent)
npm run dev
```

### Environment variables

| Variable               | Purpose                                                        |
|------------------------|----------------------------------------------------------------|
| `DATABASE_URL`         | Neon pooled connection string (`neonctl connection-string`)    |
| `NEXTAUTH_SECRET`      | `openssl rand -base64 32`                                      |
| `NEXTAUTH_URL`         | Site URL (`http://localhost:3000` locally)                     |
| `NEXT_PUBLIC_SITE_URL` | Public menu URL shown/encoded by the QR code page              |
| `ADMIN_USERNAME`       | Admin login user                                               |
| `ADMIN_PASSWORD`       | Admin login password                                           |
| `BLOB_READ_WRITE_TOKEN`| Vercel Blob token (created by `vercel blob store add`)         |

Never commit `.env.local`; set the same variables in Vercel (`vercel env add`).

## Database

- Schema: [`db/schema.sql`](db/schema.sql) — `categories`, `items`, `item_images`, `settings`, `banners`
  (translated from the former InstantDB schema).
- Data: [`db/energy-menu.json`](db/energy-menu.json) — 8 categories, 41 items with photos.
- Seed: `npm run seed:db` (safe to re-run; rows have deterministic ids).
- Public data is served by `GET /api/menu`; all writes go through `/api/admin/*` and `/api/upload`,
  which require an admin session.

## Deployment (Vercel CLI)

```bash
vercel link
vercel blob store add energy-menu-images
vercel env add DATABASE_URL production      # repeat for the other variables
vercel --prod
```

After the URL changes, update `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL`, redeploy, and regenerate the QR file:

```bash
node scripts/make-qr.mjs https://your-domain.com public/energy-menu-qr.png
```

## Admin panel

| Page       | URL                           |
|------------|-------------------------------|
| Login      | `/admin/login`                |
| Dashboard  | `/admin/dashboard`            |
| Categories | `/admin/dashboard/categories` |
| Items      | `/admin/dashboard/items`      |
| Banners    | `/admin/dashboard/banners`    |
| Settings   | `/admin/dashboard/settings`   |
| QR code    | `/admin/dashboard/qrcode`     |

## Contact / ordering

WhatsApp: +972 52-481-0393 (configured in `src/lib/config.ts`).
