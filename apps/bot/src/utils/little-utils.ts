import type { InlineKeyboardButton, UserFromGetMe } from "grammy/types";
import type { Context } from "./context";

export const onStart = ({ id, username, first_name }: UserFromGetMe) =>
	console.log(`${first_name} | @${username} [${id}] started!`);

export const normalizeName = ({
	first_name,
	last_name,
}: {
	first_name: string;
	last_name?: string | undefined | null;
}) => (last_name ? `${first_name} ${last_name}` : first_name);

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
