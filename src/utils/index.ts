import type { UserFromGetMe } from "grammy/types";

/**
 * Logs a message when the bot starts.
 *
 * @param {UserFromGetMe} user - The user info from the 'getMe' method.
 */
export const onStart = ({ id, username }: UserFromGetMe) => console.log(`✅ | ${username} [${id}] started!`);

/**
 * The chat ID where the bot logs messages.
 *
 * @type {number}
 */
export const loggingChatID: number = -1001920317075 as const;

/**
 * The thread ID where logging messages are posted.
 *
 * @type {number}
 */
export const loggingMessageThreadID: number = 12321 as const;

/**
 * The ID of the developer.
 *
 * @type {number}
 */
export const developerID: number = 946070039 as const;

/**
 * Whether the bot is running in production mode.
 *
 * @type {boolean}
 */
export const isProd: boolean = process.env.NODE_ENV === "production";
