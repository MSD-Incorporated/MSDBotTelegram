import { relations, type InferSelectModel } from "drizzle-orm";
import { bigint, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

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
	created_at: timestamp("created_at", { mode: "date", precision: 3, withTimezone: true }).defaultNow().notNull(),
});

export type TRefferal = InferSelectModel<typeof referrals>;

export const referralsRelations = relations(referrals, ({ one }) => ({
	referral: one(users, {
		fields: [referrals.referral],
		references: [users.user_id],
		relationName: "referrals",
	}),
	referrer: one(users, {
		fields: [referrals.referrer],
		references: [users.user_id],
	}),
}));
