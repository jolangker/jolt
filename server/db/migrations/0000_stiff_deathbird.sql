CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegramUserId" text NOT NULL,
	"note" text NOT NULL,
	"category" text NOT NULL,
	"amount" numeric NOT NULL,
	"transactionDate" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"telegramUserId" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "links_token_unique" UNIQUE("token")
);
