import { Composer } from "grammy";
import { randomInt } from "node:crypto";

import type { TranslationFunctions } from "@msdbot/i18n";
import { dateFormatter, keyboardBuilder, type Context } from "../utils";

export const dickComposer = new Composer<Context>();

/**
 * The timeout for a dick command in milliseconds.
 *
 * @type {number}
 */
export const timeout: number = 2 * 60 * 60 * 1000;

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
		const { dick_timeout_text, dick_history_button } = ctx.t;

		return ctx.reply(dick_timeout_text({ timeLeft, size }), {
			reply_markup: {
				inline_keyboard: [[{ text: dick_history_button(), callback_data: `dick_history_${ctx.from.id}_1` }]],
			},
		});
	}

	const difference = randomInt(-12, 12 + 1);
	const newSize = size + difference;

	await ctx.database.dicks.update(ctx.from, newSize);
	await ctx.database.dicks.addHistory(ctx.from, size, difference);

	const { text: phrase, emoji } = getPhrase(difference, ctx.t);
	return ctx.reply(ctx.t.dick_success_text({ phrase, emoji, current_size: newSize }));
});

dickComposer.chatType(["group", "supergroup", "private"]).callbackQuery(/dick_history_(\d+)_(\d+)/gm, async ctx => {
	const user_id = Number(ctx.callbackQuery.data.split("_")[2]);
	if (ctx.callbackQuery.from!.id !== user_id) return ctx.answerCallbackQuery(ctx.t.keyboard_wrong_user());

	const inline_keyboard = ctx.msg?.reply_markup?.inline_keyboard!;
	const totalPagesButton = inline_keyboard[0]!.find(button => button.text.includes("/"));
	const currentPage = Number(totalPagesButton?.text.split("/")[0]);
	const page = Number(ctx.callbackQuery.data.split("_")[3]);

	if (currentPage == page) return ctx.answerCallbackQuery(ctx.t.keyboard_same_page());

	const totalDickHistory = await ctx.database.dicks.countHistory({ id: ctx.from.id });
	if (totalDickHistory <= 0) return ctx.answerCallbackQuery(ctx.t.dick_history_empty());

	const dickHistory = await ctx.database.dicks.getHistory(ctx.callbackQuery.from, {
		limit: 10,
		offset: (page - 1) * 10,
		columns: { size: true, difference: true, created_at: true },
	});

	const pagesLength = Math.ceil(totalDickHistory / 10);
	const history = dickHistory.map(({ size, difference, created_at }, index) => {
		return ctx.t.dick_history_user({
			rank: page * 10 - 10 + index + 1,
			date: dateFormatter.format(created_at!).slice(0, 17),
			difference,
			total: size + difference,
		});
	});

	const keyboard = keyboardBuilder(ctx, "dick_history", page, user_id.toString(), pagesLength);

	return ctx.api.editMessageText(ctx.chat.id, ctx.msgId!, history.join("\n\n"), {
		reply_markup: { inline_keyboard: keyboard },
	});
});
