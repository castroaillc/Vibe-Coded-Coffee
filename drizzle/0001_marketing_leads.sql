CREATE TABLE "qr_scan" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"user_agent" text,
	"country" text,
	"region" text,
	"city" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint
ALTER TABLE "waitlist" ALTER COLUMN "email" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "phone" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "email_consent" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "email_consent_at" timestamp;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "email_opt_out_at" timestamp;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "sms_consent" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "sms_consent_at" timestamp;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "sms_consent_text" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "sms_opt_out_at" timestamp;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "consent_ip" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "consent_user_agent" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "utm_source" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "utm_medium" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "utm_campaign" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "utm_content" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "utm_term" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "qr_code" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "scan_id" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "landing_path" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "referrer" text;
--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint
CREATE INDEX "qr_scan_code_idx" ON "qr_scan" USING btree ("code","created_at");
--> statement-breakpoint
CREATE INDEX "waitlist_campaign_idx" ON "waitlist" USING btree ("utm_campaign");
--> statement-breakpoint
CREATE INDEX "waitlist_created_idx" ON "waitlist" USING btree ("created_at");
--> statement-breakpoint
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_phone_unique" UNIQUE("phone");
--> statement-breakpoint
-- Everyone who joined before this used the email-only form, which told them we would email them.
UPDATE "waitlist" SET "email_consent" = true, "email_consent_at" = "created_at" WHERE "email" IS NOT NULL;
