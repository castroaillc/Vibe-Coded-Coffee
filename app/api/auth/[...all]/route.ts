import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Sign-in, sessions and the Stripe webhook (/api/auth/stripe/webhook).
export const { GET, POST } = toNextJsHandler(auth);
