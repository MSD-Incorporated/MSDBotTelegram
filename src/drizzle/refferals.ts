import { InferSelectModel } from "drizzle-orm";
import { bigint, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

export const referrals = pgTable("referrals", {
	id: serial("id").notNull().unique(),
	referral: bigint("refferal", { mode: "number" })
		.notNull()
		.references(() => users.user_id),
	referrer: bigint("referrer", { mode: "number" })
		.notNull()
		.references(() => users.user_id),
	created_at: timestamp("created_at", { mode: "date", precision: 3 }).defaultNow(),
});

export type TRefferal = InferSelectModel<typeof referrals>;
