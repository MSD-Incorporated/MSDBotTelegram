import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { chat_users, chats } from "./chat";
import type { dick_history, dicks } from "./msdbot/dick";
import type { referrals } from "./msdbot/referrals";
import type { msdbot_users } from "./msdbot/user";
import type { user_buttons, users } from "./user";

/**
 * Dick types
 */
export type TDick = InferSelectModel<typeof dicks>;
export type TDickHistory = InferSelectModel<typeof dick_history>;

export type TDickInsert = InferInsertModel<typeof dicks>;
export type TDickHistoryInsert = InferInsertModel<typeof dick_history>;

/**
 * Referral types
 */
export type TReferral = InferSelectModel<typeof referrals>;
export type TReferralInsert = InferInsertModel<typeof referrals>;

/**
 * MSDBot types
 */
export type TMSDBotUser = InferSelectModel<typeof msdbot_users>;
export type TMSDBotUserInsert = InferInsertModel<typeof msdbot_users>;

/**
 * Chat types
 */
export type TChat = InferSelectModel<typeof chats>;
export type TChatInsert = InferInsertModel<typeof chats>;

export type TChatUsers = InferSelectModel<typeof chat_users>;
export type TChatUsersInsert = InferInsertModel<typeof chat_users>;

/**
 * User types
 */
export type TUser = InferSelectModel<typeof users>;
export type TUserInsert = InferInsertModel<typeof users>;

export type TUserButton = InferSelectModel<typeof user_buttons>;
export type TUserButtonInsert = InferInsertModel<typeof user_buttons>;

export type TMSDBotUser = InferSelectModel<typeof msdbot_user>;
export type TMSDBotUserInsert = InferInsertModel<typeof msdbot_user>;
