import type { InlineKeyboardButton, UserFromGetMe } from "grammy/types";
import type { Logger } from "../structures/logger";
import type { Context } from "./context";

/**
 * Logs a message when the bot starts.
 *
 * @param {UserFromGetMe} user - The user info from the 'getMe' method.
 */
export const onStart = (logger: Logger, { id, username, first_name }: UserFromGetMe) =>
	logger.custom(
		logger.ck.greenBright(logger.icons["success"], first_name, "|", `@${username}`, `[${id}]`, "started!\n")
	);

export const normalizeName = ({ first_name, last_name }: { first_name: string; last_name?: string }) =>
	`${first_name}` + (last_name ? ` ${last_name}` : "");

/**
 * Generates a random number between the specified minimum and maximum values.
 *
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @param {boolean} [includeMax=false] Whether to include the maximum value in the range.
 * @return {number} The generated random number.
 */
export const random = <MIN extends number, MAX extends number, IM extends boolean>(
	min: MIN,
	max: MAX,
	includeMax?: IM
): number => Math.floor(Math.random() * (max - min + (includeMax ? 1 : 0)) + min);

/**
 * The timeout for a dick command in milliseconds.
 *
 * @type {number}
 */
export const timeout: number = 12 * 60 * 60 * 1000;

/**
 * The timeout for a referral in milliseconds.
 *
 * @type {number}
 */
export const referral_timeout: number = 72 * 60 * 60 * 1000;

/**
 * Formats dates in the format "DD.MM.YYYY HH:mm:ss" and with the time zone "+00:00".
 *
 * @type {Intl.DateTimeFormat}
 */
export const dateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat("ru", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	hour: "numeric",
	minute: "numeric",
	second: "numeric",
	timeZone: "+00:00",
});

export const formatTime = (milliseconds: number): string => {
	const totalSeconds = Math.floor(milliseconds / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const pad = (num: number) => num.toString().padStart(2, "0");
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const daysUntilEvent = (today: Date, event: Date): number => {
	event.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);

	let diffTime = event.getTime() - today.getTime();
	let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 0) {
		const nextYear = new Date(event);
		nextYear.setFullYear(today.getFullYear() + 1);
		diffTime = nextYear.getTime() - today.getTime();
		diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}

	return diffDays;
};

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

export const apiRoot = process.env.LOCAL_API ?? "https://api.telegram.org";

export const isSubscriber = async (ctx: Context, user_id: number, chat_id: number) =>
	await ctx.api
		.getChatMember(chat_id, user_id)
		.then(member => ["member", "creator", "administrator"].includes(member.status))
		.catch(() => false);

export const keyboardBuilder = (ctx: Context, name: string, page: number, sub_name: string, totalPages: number) => {
	const keyboard: InlineKeyboardButton[][] = [[]];

	if (page > 1)
		keyboard[0]?.push({
			callback_data: `${name}_${sub_name}_${page - 1}`,
			text: ctx.t.keyboard_back_page(),
		});

	keyboard[0]?.push({
		callback_data: `${name}_${sub_name}_${page}`,
		text: ctx.t.keyboard_current_page({ page, totalPages }),
	});

	if (page < totalPages)
		keyboard[0]?.push({
			callback_data: `${name}_${sub_name}_${page + 1}`,
			text: ctx.t.keyboard_next_page(),
		});

	return keyboard;
};

export * from "./auto-quote";
export * from "./background_colors";
export * from "./caching";
export * from "./context";
export * from "./formatter";
export * from "./logging";
