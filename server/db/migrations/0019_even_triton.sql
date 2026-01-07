ALTER TABLE "users" ADD COLUMN "tier" text DEFAULT 'FREE' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscriptionEndsAt" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "voiceQuota" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isTrialUsed" boolean DEFAULT false NOT NULL;