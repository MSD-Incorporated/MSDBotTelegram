CREATE TABLE "dick_history" (
	"id" serial NOT NULL,
	"user_id" bigint NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"difference" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now(),
	CONSTRAINT "dick_history_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "dicks" (
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
CREATE TABLE "referrals" (
	"id" serial NOT NULL,
	"refferal" bigint PRIMARY KEY NOT NULL,
	"referrer" bigint NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now(),
	CONSTRAINT "referrals_id_unique" UNIQUE("id"),
	CONSTRAINT "referrals_refferal_unique" UNIQUE("refferal")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64),
	"username" varchar(32),
	"is_premium" boolean DEFAULT false,
	"created_at" timestamp (3) with time zone DEFAULT now(),
	"updated_at" timestamp (3) with time zone DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "dick_history" ADD CONSTRAINT "dick_history_user_id_dicks_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."dicks"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dicks" ADD CONSTRAINT "dicks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_refferal_users_id_fk" FOREIGN KEY ("refferal") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_users_id_fk" FOREIGN KEY ("referrer") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;