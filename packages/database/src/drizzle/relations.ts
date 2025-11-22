import { relations } from "drizzle-orm";

import { dick_history, dicks } from "./msdbot/dick";
import { referrals } from "./msdbot/referrals";
import { users } from "./user";

/**
 * Relations for dicks
 */
export const dicksRelations = relations(dicks, ({ many }) => ({
	history: many(dick_history, { relationName: "dick_history" }),
}));

export const dicksHistoryRelations = relations(dick_history, ({ one }) => ({
	dick: one(dicks, { fields: [dick_history.user_id], references: [dicks.user_id], relationName: "dick_history" }),
}));

/**
 * Relations for users
 */
export const userRelations = relations(users, ({ many, one }) => ({
	referrals: many(referrals, { relationName: "referrals" }),
	dick: one(dicks, { fields: [users.id], references: [dicks.user_id] }),
}));

/**
 * Relations for referrals
 */
export const referralsRelations = relations(referrals, ({ one }) => ({
	referral: one(users, { fields: [referrals.referral], references: [users.id], relationName: "referrals" }),
	referrer: one(users, { fields: [referrals.referrer], references: [users.id] }),
}));
