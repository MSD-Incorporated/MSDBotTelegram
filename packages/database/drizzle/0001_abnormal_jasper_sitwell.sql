ALTER TABLE "referrals" RENAME COLUMN "refferal" TO "referral";--> statement-breakpoint
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_refferal_unique";--> statement-breakpoint
ALTER TABLE "referrals" DROP CONSTRAINT "referrals_refferal_users_id_fk";
--> statement-breakpoint
ALTER TABLE "dick_history" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "dicks" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "dicks" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "referrals" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referral_users_id_fk" FOREIGN KEY ("referral") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referral_unique" UNIQUE("referral");