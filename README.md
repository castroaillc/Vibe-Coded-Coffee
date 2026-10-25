# Vibe Coded Coffee — website + ordering app

The B2B website for enterprise coffee catering in NYC (`/`: staffed, brewed-on-site coffee stations for
all-hands, client events, conferences, trainings, offsites and tech events, with published packages and a
"Get a quote" form) and the members' ordering app (`/order`, not linked from the public site), in one Next.js project.

## Run it on your Mac

You need Node.js 20 or newer (https://nodejs.org). Then, in Terminal:

```bash
cd ~/Desktop/"Vibe Coded Coffe"/"04 Website"
pnpm install
cp .env.example .env.local   # then fill it in — see "Backend" below
pnpm dev
```

Open http://localhost:3000 (site) and http://localhost:3000/order (app).

The first `pnpm dev` also downloads the stock photos and videos into `public/media/`
(about 15 MB, one time). If that step fails, check your connection and run `pnpm media`.

## Edit the text

All copy — location, catering offer, packages, what's included, booking steps, event types and FAQ — is in **`lib/site.ts`**.
The page, the Google structured data and `/llms.txt` all update from that one file.

## Go live (Vercel is easiest)

1. Push this folder to GitHub and import it at https://vercel.com/new.
2. Add the environment variables from `.env.example` (see "Backend" below). Waitlist sign-ups are
   saved in Neon (`waitlist` table) and get a welcome email from Resend.
3. After launch, submit `https://yourdomain.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## What's built in for SEO & GEO (AI search)

- Title, description, canonical URL, Open Graph + Twitter share image (`public/opengraph-image.png`)
- JSON-LD structured data: Organization/FoodEstablishment, Service with one Offer per package, WebSite, WebPage and FAQPage
- `sitemap.xml`, `robots.txt` (welcomes Google, Bing and AI crawlers: GPTBot, ClaudeBot, PerplexityBot…), web manifest, favicons
- `/llms.txt` — a plain-text fact sheet for AI assistants
- Answer-first "quick facts" strip and a visible FAQ, so AI engines can quote clear facts
- One `h1`, semantic sections, accessible form labels, fast static page (only the form uses JavaScript)
- Fonts (Montserrat + Inter) self-hosted through `next/font` — no layout shift, no third-party requests

## The ordering app (/order)

A phone app that lives inside this website. Members open `yourdomain.com/order`, tap **Add** to put it
on their home screen, and from then on it opens full-screen like a native app.

- **Order:** pick a drink (from the menu in `lib/menu.ts`), size, bean, milk and add-ons, then
  **Queue my coffee**. Options live in `lib/app-data.ts`.
- **Favorites:** save any drink and queue it again in one tap.
- **Pass:** a QR code the kiosk scans. It's a signed member code that changes every day; the kiosk
  looks up the queued drink on the server. Members without their phone can give their number instead.
- **Points:** +10 per daily coffee, +15 per event check-in; 100 points = a free pastry (`lib/app-data.ts`).
- **Events:** events from the database with RSVP; `pnpm db:seed` adds 4 weeks of the samples in `lib/app-data.ts`.
- **Membership:** members start a Stripe subscription with a 30-day free trial before they can order.

"Add to Home Screen" is one tap on Android and desktop Chrome/Edge. iPhone Safari doesn't allow apps
to trigger it, so the app shows the two steps (Share → Add to Home Screen) instead.

## Admin: Coffee OS (/admin)

The back office for the catering business, made for an iPad or laptop. Sign in at `/admin` with the one
shared password in `ADMIN_PASSWORD`.

- **Dashboard:** open leads, booked events coming up (with how much coffee to bring), money still owed, POS sales today.
- **Pipeline:** every catering job as a card in Lead → Quoted → Booked → Completed (or Lost). "Book us for your event"
  requests from the website land here as leads automatically, with the client created or matched by email.
- **Event page:** edit details, quote and payments, one-tap status, notes, coffee to bring, POS sales at that event.
- **Clients:** search, contact details, booked value, what's owed, every event and a notes log.
- **POS:** tap items, pick the event, record card / cash / comp. Take card payments on a Stripe reader or Tap to Pay in
  the Stripe Dashboard app, then record them here. "Edit menu" changes items and prices.
- **Brew planner:** the coffee and cost-per-cup calculators from coffee-app (math in `lib/brew.ts`).

Tables: `client`, `catering_event`, `client_note`, `product`, `sale` (in `lib/db/schema.ts`). Server actions are in
`app/admin/actions.ts`, queries in `lib/admin/data.ts`.

## Backend (Better Auth · Neon · Resend · Stripe)

| Piece | What it does | Where |
|---|---|---|
| **Neon Postgres + Drizzle** | booking requests, members, favorites, orders, points ledger, events, RSVPs, waitlist | `lib/db/schema.ts` |
| **Better Auth** | sign in with a 6-digit email code; 90-day sessions on the phone | `lib/auth.ts`, `/api/auth/*` |
| **Resend** | booking alerts + confirmations, sign-in codes, waitlist welcome, "membership active" emails | `lib/email.ts` |
| **Stripe** (Better Auth plugin) | the membership subscription, 30-day free trial = free first month | `lib/auth.ts` |
| **WhatsApp Cloud API** | speed to lead: a new booking request WhatsApps `LEAD_ALERT_PHONE` with a tap-to-call number | `lib/whatsapp.ts`, `pnpm whatsapp:template` |

Sign-in uses an emailed **code**, not a magic link: on iPhone a link opens Safari instead of the
home-screen app, so members would end up signed in in the wrong place.

### One-time setup
1. **Install packages:** `pnpm install`
2. **Neon:** in Vercel → your project → Storage → create a **Neon** database. It adds `DATABASE_URL`
   and `DATABASE_URL_UNPOOLED`. Run `vercel env pull .env.local` to copy them locally
   (or copy `.env.example` to `.env.local` and paste them in).
3. **Secrets:** fill `BETTER_AUTH_SECRET` and `PASS_SIGNING_SECRET` (`openssl rand -base64 32`) and
   `KIOSK_API_KEY` (`openssl rand -hex 24`).
4. **Create the tables:** `pnpm db:generate` then `pnpm db:migrate`. Seed sample events: `pnpm db:seed`.
5. **Resend:** create an API key, verify your domain (resend.com/domains), set `RESEND_API_KEY` and
   `EMAIL_FROM`. Without a key, emails (including sign-in codes) print in the terminal, so you can
   develop without it.
6. **Stripe:** create a Product "Vibe Coded Membership" with a monthly Price → `STRIPE_MEMBERSHIP_PRICE_ID`.
   Add a webhook to `https://YOUR-DOMAIN/api/auth/stripe/webhook` with `checkout.session.completed`,
   `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   → `STRIPE_WEBHOOK_SECRET`. Locally: `stripe listen --forward-to localhost:3000/api/auth/stripe/webhook`.
7. Add the same env vars in Vercel (Production + Preview) and deploy.

After upgrading Better Auth, run `npx auth@latest generate` and compare its output with the auth tables
at the top of `lib/db/schema.ts`.

### Member API (signed-in, used by the app)
- `GET /api/app/state` — everything the app shows
- `POST /api/app/profile` `{ name, phone }`
- `POST /api/app/orders` `{ order }` · `DELETE /api/app/orders` — queue / cancel (needs an active membership; one coffee a day)
- `POST /api/app/favorites` `{ name, order }` · `DELETE /api/app/favorites/:id`
- `POST /api/app/events/:id/rsvp` — toggle RSVP

### Kiosk API (header `Authorization: Bearer $KIOSK_API_KEY`)
The QR on a pass is `VCC2.<memberCode>.<YYYYMMDD>.<signature>`. It is signed with
`PASS_SIGNING_SECRET` and only valid today, so screenshots stop working tomorrow.

```bash
# 1. Scan: who is this, and what do they want?
curl -X POST $SITE/api/kiosk/scan -H "Authorization: Bearer $KIOSK_API_KEY" \
  -H "Content-Type: application/json" -d '{"pass":"VCC2.7F3K2Q.20261019.xxxxxxxxxxxx"}'   # or {"phone":"5555550123"}
# 2. Hand over: mark collected (+10 points). Use orderId from step 1, or send the favorite's order.
curl -X POST $SITE/api/kiosk/collect -H "Authorization: Bearer $KIOSK_API_KEY" \
  -H "Content-Type: application/json" -d '{"memberCode":"7F3K2Q","orderId":"..."}'
# Event check-in at the door (+15 points)
curl -X POST $SITE/api/kiosk/checkin -H "Authorization: Bearer $KIOSK_API_KEY" \
  -H "Content-Type: application/json" -d '{"pass":"VCC2....","eventId":"demo-night-2026-10-22"}'
```

### Still to build
- **Kiosk screen:** a tablet page that reads the QR with the camera and calls the kiosk API.
- **Admin:** create real events, see today's orders, adjust points.
- **Rewards redemption:** spend 100 points on a pastry at the kiosk.
- **Waitlist → members:** when you open, email the waitlist an invite to the app (Resend broadcast).

## Photos & video

All media is listed in **`media.json`**. To swap a photo, change its `url` (and `alt` text), delete the old
file from `public/media/`, and run `pnpm media`. When you have your own shop photography, drop it into
`public/media/` with the same file names.

Sources (free for commercial use, no attribution required):
- Beans pouring into a grinder (video): Mixkit free license, https://mixkit.co/license/
- Photos (hero café at night, espresso extraction, latte art pour, Chemex pour-over, builder at a cafe, grinder hopper): Unsplash License, https://unsplash.com/license
  - The exact source page for each file is in `media.json` under `source`.

## Files

- `app/page.tsx` — the page
- `app/globals.css` — styles (brand colors at the top)
- `components/WaitlistForm.tsx` — the sign-up form
- `components/LoopVideo.tsx` — muted looping video with a pause button (stays still for people who turn off motion)
- `scripts/download-media.mjs` — downloads the photos/videos in `media.json`
- `components/BookingForm.tsx` — the "Book us for your event" form
- `app/api/booking/route.ts` — receives booking requests (saved in the `booking_request` table; emails you at
  `BOOKING_NOTIFY_EMAIL` with Reply-To set to the organizer, and sends them a confirmation)
- `app/api/waitlist/route.ts` — receives storefront waitlist sign-ups
- `public/brand/` — logo files
