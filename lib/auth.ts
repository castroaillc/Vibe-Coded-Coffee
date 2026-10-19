import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendMembershipStarted, sendSignInCode } from "@/lib/email";

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");

/** The one paid plan. The free trial is the "first month free" offer. */
export const MEMBERSHIP_PLAN = "membership";

export const auth = betterAuth({
  appName: "Vibe Coded Coffee",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  session: {
    expiresIn: 60 * 60 * 24 * 90, // stay signed in on your phone for 90 days
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  plugins: [
    // Sign in with a 6-digit code sent by email (Resend). Codes keep members inside the
    // home-screen app; a magic link would open Safari instead.
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp }) {
        await sendSignInCode(email, otp);
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: MEMBERSHIP_PLAN,
            priceId: process.env.STRIPE_MEMBERSHIP_PRICE_ID ?? "",
            freeTrial: { days: 30 },
          },
        ],
        // Members can only manage their own subscription.
        authorizeReference: async ({ user, referenceId }) => referenceId === user.id,
        onSubscriptionComplete: async ({ subscription }) => {
          const [u] = await db.select({ email: schema.user.email }).from(schema.user).where(eq(schema.user.id, subscription.referenceId));
          if (u) await sendMembershipStarted(u.email, subscription.trialEnd ?? null).catch((e) => console.error("[email]", e));
        },
      },
    }),
    nextCookies(), // must stay last
  ],
});

export type Session = typeof auth.$Infer.Session;
