import { Composer } from "grammy";
import type { Context } from "../utils";

const timeout = 12 * 60 * 60;

export const dickComposer = new Composer<Context>();

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
