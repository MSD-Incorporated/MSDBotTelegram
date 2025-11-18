CREATE TABLE "users" (
	"id" serial NOT NULL,
	"user_id" bigint PRIMARY KEY NOT NULL,
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64),
	"username" varchar(32),
	"is_premium" boolean DEFAULT false,
	"created_at" timestamp (3) with time zone DEFAULT now(),
	"updated_at" timestamp (3) with time zone DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id")
);
