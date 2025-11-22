import { Composer } from "grammy";
import { randomInt } from "node:crypto";

import type { TranslationFunctions } from "@msdbot/i18n";
import { dateFormatter, type Context } from "../utils";

export const dickComposer = new Composer<Context>();

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

const getPhrase = (difference: number, t: TranslationFunctions) => {
	if (difference < 0) return { text: t.dick_decreased({ difference: difference.toString().slice(1) }), emoji: "📉" };
	if (difference > 0) return { text: t.dick_increased({ difference: difference.toString() }), emoji: "📈" };
	return { text: t.dick_not_changed(), emoji: "😐" };
};

dickComposer.chatType(["group", "supergroup", "private"]).command(["dick", "cock"], async ctx => {
	const { size, timestamp } = await ctx.database.dicks.resolve(ctx.from, {
		createIfNotExist: true,
		columns: { size: true, timestamp: true },
	});

	const lastUsed = Date.now() - timestamp.getTime();

	if (lastUsed < timeout) {
		const timeLeft = dateFormatter.format(timeout - lastUsed).slice(12);
		const { dick_timeout_text } = ctx.t;

		return ctx.reply(dick_timeout_text({ timeLeft, size }), {});
	}

	const difference = randomInt(-12, 12 + 1);
	const newSize = size + difference;

	await ctx.database.dicks.update(ctx.from, newSize);
	await ctx.database.dicks.addHistory(ctx.from, newSize, difference);

	const { text: phrase, emoji } = getPhrase(difference, ctx.t);
	return ctx.reply(ctx.t.dick_success_text({ phrase, emoji, current_size: newSize }));
});
