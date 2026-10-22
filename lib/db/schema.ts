import { sql } from "drizzle-orm";
import {
  boolean, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import type { Order } from "@/lib/app-data";

// ─────────────────────────────────────────────────────────────
//  Better Auth tables (user, session, account, verification)
//  + Stripe plugin table (subscription).
//  Keep these in sync with Better Auth: after upgrading it, run
//  `npx auth@latest generate` and compare.
// ─────────────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  plan: text("plan").notNull(),
  referenceId: text("reference_id").notNull(), // the user id
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").default("incomplete"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  cancelAt: timestamp("cancel_at"),
  canceledAt: timestamp("canceled_at"),
  endedAt: timestamp("ended_at"),
  seats: integer("seats"),
  billingInterval: text("billing_interval"),
  stripeScheduleId: text("stripe_schedule_id"),
});

// ─────────────────────────────────────────────────────────────
//  Vibe Coded app tables
// ─────────────────────────────────────────────────────────────

/** One row per member: the phone number the kiosk can look up and the code printed in the pass. */
export const member = pgTable("member", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  phone: text("phone").notNull().unique(),
  memberCode: text("member_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorite = pgTable(
  "favorite",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    order: jsonb("order").$type<Order>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("favorite_user_idx").on(t.userId)],
);

/** status: queued → collected | cancelled. One collected drink per member per day (collected_on). */
export const coffeeOrder = pgTable(
  "coffee_order",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    order: jsonb("order").$type<Order>().notNull(),
    status: text("status", { enum: ["queued", "collected", "cancelled"] }).notNull().default("queued"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    collectedAt: timestamp("collected_at"),
    collectedOn: text("collected_on"), // YYYY-MM-DD in the shop's time zone
  },
  (t) => [
    index("order_user_idx").on(t.userId),
    uniqueIndex("order_one_queued_per_user").on(t.userId).where(sql`${t.status} = 'queued'`),
    uniqueIndex("order_one_collected_per_day").on(t.userId, t.collectedOn).where(sql`${t.status} = 'collected'`),
  ],
);

/** Append-only points ledger; a member's balance is the sum of delta. */
export const pointsLedger = pgTable(
  "points_ledger",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: text("reason", { enum: ["coffee", "event", "reward", "adjustment"] }).notNull(),
    refId: text("ref_id"),
    note: text("note"), // shown in the member's history, e.g. "Rejoicing… · Medium · Oat"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("points_user_idx").on(t.userId), uniqueIndex("points_ref_unique").on(t.reason, t.refId)],
);

export const event = pgTable("event", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  verb: text("verb").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  body: text("body").notNull(),
  spots: integer("spots").notNull(),
});

export const rsvp = pgTable(
  "rsvp",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    eventId: text("event_id").notNull().references(() => event.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    checkedInAt: timestamp("checked_in_at"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.eventId] })],
);

/**
 * Marketing list: everyone who joined from the site or a QR code.
 * A lead has an email, a phone, or both. Consent is recorded per channel with
 * the exact wording they agreed to, when, and from where (keep this as proof).
 * Only email people with emailConsent and no emailOptOutAt; only text people
 * with smsConsent and no smsOptOutAt.
 */
export const waitlist = pgTable(
  "waitlist",
  {
    id: text("id").primaryKey(),
    email: text("email").unique(),
    phone: text("phone").unique(), // E.164, e.g. +19175550101
    firstName: text("first_name"),
    source: text("source"), // which form: hero, footer, free_coffee…
    emailConsent: boolean("email_consent").default(false).notNull(),
    emailConsentAt: timestamp("email_consent_at"),
    emailOptOutAt: timestamp("email_opt_out_at"),
    smsConsent: boolean("sms_consent").default(false).notNull(),
    smsConsentAt: timestamp("sms_consent_at"),
    smsConsentText: text("sms_consent_text"),
    smsOptOutAt: timestamp("sms_opt_out_at"),
    consentIp: text("consent_ip"),
    consentUserAgent: text("consent_user_agent"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),
    qrCode: text("qr_code"), // the /q/<code> they scanned, if any
    scanId: text("scan_id"),
    landingPath: text("landing_path"),
    referrer: text("referrer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("waitlist_campaign_idx").on(t.utmCampaign), index("waitlist_created_idx").on(t.createdAt)],
);

/** One row per QR scan (a visit to /q/<code>), so scans → sign-ups is measurable. */
export const qrScan = pgTable(
  "qr_scan",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    userAgent: text("user_agent"),
    country: text("country"),
    region: text("region"),
    city: text("city"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("qr_scan_code_idx").on(t.code, t.createdAt)],
);

/** "Book us for your event" requests from event organizers (B2B catering). status: new → quoted → booked | declined. */
export const bookingRequest = pgTable(
  "booking_request",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    phone: text("phone"),
    eventType: text("event_type"),
    eventDate: text("event_date").notNull(), // YYYY-MM-DD
    headcount: integer("headcount").notNull(),
    location: text("location").notNull(),
    notes: text("notes"),
    status: text("status", { enum: ["new", "quoted", "booked", "declined"] }).notNull().default("new"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("booking_event_date_idx").on(t.eventDate)],
);

// ─────────────────────────────────────────────────────────────
//  Admin: CRM (clients, catering events, notes) and POS
//  (products, sales). Money is in cents.
// ─────────────────────────────────────────────────────────────

export const EVENT_STATUSES = ["lead", "quoted", "booked", "completed", "lost"] as const;
export const PAYMENT_STATUSES = ["unpaid", "deposit", "paid"] as const;
export const PAYMENT_METHODS = ["card", "cash", "comp"] as const;

/** A company or person who books us. */
export const client = pgTable(
  "client",
  {
    id: text("id").primaryKey(),
    company: text("company").notNull().default(""),
    contactName: text("contact_name").notNull().default(""),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull().default(""),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("client_email_idx").on(t.email)],
);

/** A catering job, from first inquiry (lead) to completed. */
export const cateringEvent = pgTable(
  "catering_event",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id").notNull().references(() => client.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    eventType: text("event_type").notNull().default(""),
    date: text("date").notNull(), // YYYY-MM-DD
    startTime: text("start_time").notNull().default(""), // HH:MM
    location: text("location").notNull().default(""),
    headcount: integer("headcount").notNull().default(0),
    status: text("status", { enum: EVENT_STATUSES }).notNull().default("lead"),
    quoteCents: integer("quote_cents").notNull().default(0),
    paidCents: integer("paid_cents").notNull().default(0),
    paymentStatus: text("payment_status", { enum: PAYMENT_STATUSES }).notNull().default("unpaid"),
    notes: text("notes").notNull().default(""),
    source: text("source", { enum: ["manual", "website"] }).notNull().default("manual"),
    bookingRequestId: text("booking_request_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("catering_event_client_idx").on(t.clientId), index("catering_event_date_idx").on(t.date)],
);

/** CRM activity log: calls, emails, follow-ups. */
export const clientNote = pgTable(
  "client_note",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id").notNull().references(() => client.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => cateringEvent.id, { onDelete: "set null" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("client_note_client_idx").on(t.clientId)],
);

/** What the POS sells. */
export const product = pgTable("product", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export type SaleItem = { productId: string | null; name: string; qty: number; unitCents: number };

/** One POS checkout. Card payments are taken on the Stripe reader (or Tap to Pay) and recorded here. */
export const sale = pgTable(
  "sale",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").references(() => cateringEvent.id, { onDelete: "set null" }),
    items: jsonb("items").$type<SaleItem[]>().notNull(),
    totalCents: integer("total_cents").notNull(),
    method: text("method", { enum: PAYMENT_METHODS }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("sale_created_idx").on(t.createdAt)],
);

/** Small key → JSON settings store for the admin (e.g. "pricing": supply prices, labor rate, service rates). */
export const appSetting = pgTable("app_setting", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
