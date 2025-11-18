CREATE TABLE "referrals" (
	"id" serial NOT NULL,
	"refferal" bigint PRIMARY KEY NOT NULL,
	"referrer" bigint NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now(),
	CONSTRAINT "referrals_id_unique" UNIQUE("id"),
	CONSTRAINT "referrals_refferal_unique" UNIQUE("refferal")
);
--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_refferal_users_user_id_fk" FOREIGN KEY ("refferal") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_users_user_id_fk" FOREIGN KEY ("referrer") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;