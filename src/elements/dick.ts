import { Composer } from "grammy";
import { code, random, type Context } from "../utils";

const timeout = 12 * 60 * 60 * 1000;
const dateFormatter = new Intl.DateTimeFormat("ru", {
	hour: "numeric",
	minute: "numeric",
	second: "numeric",
	timeZone: "+00:00",
});

export const dickComposer = new Composer<Context>();

const getPhrase = (difference: number) => {
	if (difference < 0) return `уменьшился на ${code(difference.toString().slice(1))} см!`;
	if (difference > 0) return `увеличился на ${code(difference.toString())} см!`;
	return "не изменился!";
};

dickComposer.command(["dick", "cock"], async ctx => {
	const user = ctx.from!;
	const { size, timestamp } = (await ctx.database.resolveDick(user, true))!;

	const now = Date.now();
	const lastUsed = now - timestamp.getTime();

	if (lastUsed < timeout) {
		const timeLeft = dateFormatter.format(timeout - lastUsed);
		const { dick_timeout_text, dick_history_button } = ctx.t;

		return ctx.reply(dick_timeout_text({ timeLeft, size }), {
			parse_mode: "HTML",
			reply_markup: {
				inline_keyboard: [[{ text: dick_history_button(), callback_data: `dick_history_${user.id}_1` }]],
			},
		});
	}

	const difference = random(-7, 7, true);

	await ctx.database.updateDick(user, { size: size + difference, timestamp: new Date(now) });
	await ctx.database.writeDickHistory({ id: user.id, size, difference });

	return ctx.reply(ctx.t.dick_success_text({ phrase: getPhrase(difference), current_size: size + difference }), {
		parse_mode: "HTML",
	});
});

dickComposer.command(["lb", "leaderboard"], async ctx => {
	const { dick_leaderboard_choose_text, dick_leaderboard_ascending_button, dick_leaderboard_descending_button } =
		ctx.t;

	return ctx.reply(dick_leaderboard_choose_text({ emoji: "📊" }), {
		reply_markup: {
			inline_keyboard: [
				[
					{ text: dick_leaderboard_ascending_button({ emoji: "📈" }), callback_data: "leaderboard_asc_1" },
					{ text: dick_leaderboard_descending_button({ emoji: "📉" }), callback_data: "leaderboard_desc_1" },
				],
			],
		},
	});
});
