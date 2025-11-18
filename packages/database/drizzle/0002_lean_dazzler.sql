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
ALTER TABLE "dick_history" ADD CONSTRAINT "dick_history_user_id_dicks_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."dicks"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dicks" ADD CONSTRAINT "dicks_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;