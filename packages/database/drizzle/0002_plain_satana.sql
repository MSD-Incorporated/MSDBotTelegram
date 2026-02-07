CREATE TYPE "public"."types" AS ENUM('dick', 'dice', 'referral', 'transfer');--> statement-breakpoint
ALTER TABLE "dick_history" ADD COLUMN "type" "types" DEFAULT 'dick' NOT NULL;