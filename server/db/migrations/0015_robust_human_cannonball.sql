CREATE TABLE "dashboard_access_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"codeDigest" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"consumedAt" timestamp,
	"supersededAt" timestamp,
	"outcome" text DEFAULT 'issued' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dashboard_access_links_codeDigest_unique" UNIQUE("codeDigest")
);
--> statement-breakpoint
ALTER TABLE "dashboard_access_links" ADD CONSTRAINT "dashboard_access_links_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dashboard_access_links_user_created_idx" ON "dashboard_access_links" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_access_links_digest_idx" ON "dashboard_access_links" USING btree ("codeDigest");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_telegramUserId_unique" UNIQUE("telegramUserId");