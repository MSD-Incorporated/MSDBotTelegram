import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { chat_users, chats } from "./chat";
import type { dick_history, dicks } from "./dick";
import type { referrals } from "./referrals";
import type { user_buttons, users } from "./user";

/**
 * Chat types
 */
export type TChat = InferSelectModel<typeof chats>;
export type TChatInsert = InferInsertModel<typeof chats>;

export type TChatUsers = InferSelectModel<typeof chat_users>;
export type TChatUsersInsert = InferInsertModel<typeof chat_users>;

/**
 * Dick types
 */
export type TDick = InferSelectModel<typeof dicks>;
export type TDickHistory = InferSelectModel<typeof dick_history>;

export type TDickInsert = InferInsertModel<typeof dicks>;
export type TDickHistoryInsert = InferInsertModel<typeof dick_history>;

/**
 * User types
 */
export type TUser = InferSelectModel<typeof users>;
export type TUserInsert = InferInsertModel<typeof users>;

export type TUserButton = InferSelectModel<typeof user_buttons>;
export type TUserButtonInsert = InferInsertModel<typeof user_buttons>;

/**
 * Referral types
 */
export type TReferral = InferSelectModel<typeof referrals>;
export type TReferralInsert = InferInsertModel<typeof referrals>;
