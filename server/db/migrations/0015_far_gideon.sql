CREATE TABLE "insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"monthYear" text NOT NULL,
	"content" jsonb NOT NULL,
	"lastGenerated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;