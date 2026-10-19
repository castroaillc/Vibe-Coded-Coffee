import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
  console.warn("[db] DATABASE_URL is not set");
}

// Neon's HTTP driver: one fetch per query, ideal for Vercel functions.
const sql = neon(process.env.DATABASE_URL ?? "postgresql://user:pass@localhost/placeholder");
export const db = drizzle({ client: sql, schema });
export { schema };
