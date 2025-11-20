ALTER TABLE "user_tokens" ALTER COLUMN "expiresAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;