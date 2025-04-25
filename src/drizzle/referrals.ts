import { relations, type InferSelectModel } from "drizzle-orm";
import { bigint, pgTable, serial } from "drizzle-orm/pg-core";
import { users } from "./user";
import { creationTimestamp } from "./utils";

export const referrals = pgTable("referrals", {
	id: serial("id").notNull().unique(),
	referral: bigint("refferal", { mode: "number" })
		.references(() => users.user_id)
		.notNull(),
	referrer: bigint("referrer", { mode: "number" })
		.unique()
		.primaryKey()
		.references(() => users.user_id)
		.notNull(),
	created_at: creationTimestamp,
});

export type TRefferal = InferSelectModel<typeof referrals>;

export const referralsRelations = relations(referrals, ({ one }) => ({
	referral: one(users, { fields: [referrals.referral], references: [users.user_id], relationName: "referrals" }),
	referrer: one(users, { fields: [referrals.referrer], references: [users.user_id] }),
}));
