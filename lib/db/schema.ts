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

export const waitlist = pgTable("waitlist", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
