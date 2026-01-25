CREATE TABLE IF NOT EXISTS "dick_history" (
	"id" serial NOT NULL,
	"user_id" bigint NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"difference" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now(),
	CONSTRAINT "dick_history_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dicks" (
	"id" serial NOT NULL,
	"user_id" bigint PRIMARY KEY NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"timestamp" timestamp (3) with time zone DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	"referral_timestamp" timestamp (3) with time zone DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now(),
	"updated_at" timestamp (3) with time zone DEFAULT now(),
	CONSTRAINT "dicks_id_unique" UNIQUE("id"),
	CONSTRAINT "dicks_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referrals" (
	"id" serial NOT NULL,
	"refferal" bigint PRIMARY KEY NOT NULL,
	"referrer" bigint NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now(),
	CONSTRAINT "referrals_id_unique" UNIQUE("id"),
	CONSTRAINT "referrals_refferal_unique" UNIQUE("refferal")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64),
	"username" varchar(32),
	"is_premium" boolean DEFAULT false,
	"created_at" timestamp (3) with time zone DEFAULT now(),
	"updated_at" timestamp (3) with time zone DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id")
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dick_history_user_id_dicks_user_id_fk') THEN
        ALTER TABLE "dick_history"
        ADD CONSTRAINT "dick_history_user_id_dicks_user_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."dicks"("user_id")
        ON DELETE no action ON UPDATE no action;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dicks_user_id_users_id_fk') THEN
        ALTER TABLE "dicks"
        ADD CONSTRAINT "dicks_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
        ON DELETE no action ON UPDATE no action;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'referrer') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_referrer_users_id_fk') THEN
            ALTER TABLE IF EXISTS "referrals"
            ADD CONSTRAINT "referrals_referrer_users_id_fk"
            FOREIGN KEY ("referrer") REFERENCES "public"."users"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_referrer_users_id_fk') THEN
        ALTER TABLE IF EXISTS "referrals"
        ADD CONSTRAINT "referrals_referrer_users_id_fk"
        FOREIGN KEY ("referrer") REFERENCES "public"."users"("id")
        ON DELETE no action ON UPDATE no action;
    END IF;
END $$;