ALTER TABLE "expenses" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "telegramUserId" text NOT NULL;