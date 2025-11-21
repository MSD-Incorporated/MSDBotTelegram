import { Composer } from "grammy";
import type { Context } from "../utils";

export const dickComposer = new Composer<Context>();

dickComposer.chatType(["group", "supergroup", "private"]).command(["dick", "cock"], async ctx => {
	const { id, size, timestamp } = await ctx.database.dicks.resolve(ctx.from, {
		createIfNotExist: true,
		columns: { id: false, size: true, timestamp: true },
	});
	const lastUsed = Date.now() - timestamp.getTime();

	// if (lastUsed < timeout) {
	// 	const timeLeft = dateFormatter.format(timeout - lastUsed).slice(12);
	// 	const { dick_timeout_text, dick_history_button } = ctx.t;

	// 	return ctx.reply(dick_timeout_text({ timeLeft, size }), {
	// 		reply_markup: {
	// 			inline_keyboard: [[{ text: dick_history_button(), callback_data: `dick_history_${user.id}_1` }]],
	// 		},
	// 	});
	// }

	// const difference = random(-12, 12, true);
	// const newSize = size + difference;

	// await ctx.database.dicks.update(user.id, newSize);
	// await ctx.database.dicks.addHistory(user.id, newSize, difference);

	// return ctx.reply(ctx.t.dick_success_text({ phrase: getPhrase(difference, ctx.t), current_size: newSize }));
});
