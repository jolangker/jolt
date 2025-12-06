ALTER TABLE "categories" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "is_default" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;