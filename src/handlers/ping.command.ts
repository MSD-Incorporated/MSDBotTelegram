import type { Context } from "grammy";

export const pingCommand = async (ctx: Context) => {
	const startTime = Date.now();
	await ctx.api.getMe();
	const endTime = Date.now();

	return ctx.reply(`🏓 Текущий пинг: <code>${endTime - startTime}мс</code>`, {
		parse_mode: "HTML",
	});
};
