DO $$
BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'refferal') THEN
        ALTER TABLE "referrals" RENAME COLUMN "refferal" TO "referral";
    END IF;
END $$;
--> statement-breakpoint

ALTER TABLE "referrals" DROP CONSTRAINT IF EXISTS "referrals_refferal_unique";
--> statement-breakpoint
ALTER TABLE "referrals" DROP CONSTRAINT IF EXISTS "referrals_refferal_users_id_fk";
--> statement-breakpoint

ALTER TABLE "dick_history" ALTER COLUMN "created_at" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "dicks" ALTER COLUMN "created_at" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "dicks" ALTER COLUMN "updated_at" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "referrals" ALTER COLUMN "created_at" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;
--> statement-breakpoint

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_referral_users_id_fk') THEN
        ALTER TABLE "referrals" 
        ADD CONSTRAINT "referrals_referral_users_id_fk" 
        FOREIGN KEY ("referral") REFERENCES "public"."users"("id") 
        ON DELETE no action ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_referral_unique') THEN
        ALTER TABLE "referrals" 
        ADD CONSTRAINT "referrals_referral_unique" UNIQUE("referral");
    END IF;
END $$;