import { asc, desc, eq } from "drizzle-orm";
import { Composer, type Context } from "grammy";
import moment from "moment";
import type { Database } from "structures/database";
import { dicks } from "../drizzle/dick";

const timeout = 12 * 60 * 60;

export const dickComposer: Composer<Context & { database: Database }> = new Composer();

dickComposer.command("dick", async ctx => {
	const user = ctx.msg.from!;
	const db_user_dick = (await ctx.database.resolveDick(user, true))!;

	const size = db_user_dick.size;

	const now = moment().unix();
	const lastUsed = now - db_user_dick.timestamp.getTime();

	if (lastUsed < timeout) {
		const timeLeft = moment((timeout - lastUsed) * 1000)
			.utc(false)
			.format("HH:mm:ss");

		return ctx.reply(
			`Попробуйте через <code>${timeLeft}</code> \n\nВаш текущий размер pp: <code>${size}</code> см \n\nИстории на данный момент нет - ожидайте в будущем`,
			{ parse_mode: "HTML" }
		);
	}

	const difference = Math.floor(Math.random() * (7 - -7 + 1)) + -7;

	await ctx.database.updateDick(user, { size: size + difference, timestamp: new Date(now) });
	await ctx.database.writeDickHistory({ id: user.id, size, difference });

	const phrase =
		difference < 0
			? `уменьшился на <code>${difference.toString().slice(1)}</code> см!`
			: difference > 0
				? `увеличился на <code>${difference}</code> см!`
				: "не изменился";

	return ctx.reply(`Ваш pp ${phrase} \n\nВаш текущий размер pp: <code>${size + difference}</code> см`, {
		parse_mode: "HTML",
	});
});

dickComposer.command(["lb", "leaderboard"], async ctx => {
	return ctx.reply("Выберите тип таблицы", {
		reply_markup: {
			inline_keyboard: [
				[
					{ text: "📈 По возрастанию", callback_data: "leaderboard_asc" },
					{ text: "📉 По убыванию", callback_data: "leaderboard_desc" },
				],
			],
		},
	});
});

dickComposer.callbackQuery(["leaderboard_asc", "leaderboard_desc"], async ctx => {
	const type = ctx.callbackQuery.data === "leaderboard_asc" ? "asc" : "desc";
	const allUsers = await ctx.database.db
		.select()
		.from(dicks)
		.orderBy(type === "desc" ? asc(dicks.size) : desc(dicks.size))
		.limit(10);
	if (allUsers.length < 0) return ctx.reply("Таблица лидеров пуста");

	const filtered = allUsers.filter(({ size }) => size !== 0);
	const text = filtered.map(async ({ user_id, size }, index) => {
		const user_data = (await ctx.database.resolveUser({ id: user_id }, true))!;
		const name = user_data.first_name + (user_data?.last_name == undefined ? "" : ` ${user_data.last_name}`);

		return `<b>${index + 1}.</b> ${name}: <code>${size}</code> см`;
	});

	const message = ctx.callbackQuery.message;

	return ctx.api.editMessageText(message?.chat.id!, message?.message_id!, (await Promise.all(text)).join("\n"), {
		parse_mode: "HTML",
	});
});
