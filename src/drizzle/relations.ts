import { relations } from "drizzle-orm";

import { chat_users, chats } from "./chat";
import { dick_history, dicks } from "./msdbot/dick";
import { referrals } from "./msdbot/referrals";
import { msdbot_user } from "./msdbot/user";
import { user_buttons, users } from "./user";

/**
 * Relations for chats
 */
export const chatRelations = relations(chats, ({ many }) => ({
	users: many(chat_users, { relationName: "chat_chat_users" }),
}));

export const chatUserRelations = relations(chat_users, ({ one }) => ({
	chat: one(chats, { fields: [chat_users.chat_id], references: [chats.chat_id], relationName: "chat_chat_users" }),
	user: one(users, { fields: [chat_users.user_id], references: [users.user_id], relationName: "user_chat_users" }),
}));

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
	chats: many(chat_users, { relationName: "user_chat_users" }),
	referrals: many(referrals, { relationName: "referrals" }),
	buttons: many(user_buttons, { relationName: "user_buttons" }),
	dick: one(dicks, { fields: [users.user_id], references: [dicks.user_id] }),
	msdbot: one(msdbot_user, { fields: [users.user_id], references: [msdbot_user.user_id] }),
}));

export const userButtonsRelations = relations(user_buttons, ({ one }) => ({
	user: one(users, { fields: [user_buttons.user_id], references: [users.user_id], relationName: "user_buttons" }),
}));

export const msdbotRelations = relations(msdbot_user, ({ one }) => ({
	user: one(users, { fields: [msdbot_user.user_id], references: [users.user_id], relationName: "msdbot_user" }),
}));

/**
 * Relations for referrals
 */
export const referralsRelations = relations(referrals, ({ one }) => ({
	referral: one(users, { fields: [referrals.referral], references: [users.user_id], relationName: "referrals" }),
	referrer: one(users, { fields: [referrals.referrer], references: [users.user_id] }),
}));
