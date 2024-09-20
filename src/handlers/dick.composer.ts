import { asc, desc } from "drizzle-orm";
import { Composer, type Context } from "grammy";
import moment from "moment";
import type { Database } from "structures/database";
import type { InlineKeyboardButton } from "typegram";
import { dicks } from "../drizzle/dick";

const timeout = 12 * 60 * 60;
const random = (min: number, max: number, includeMax?: boolean) =>
	Math.floor(Math.random() * (max - min + 1) + (includeMax ? min : 0));

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
			[`Попробуйте через <code>${timeLeft}</code>`, `Ваш текущий размер pp: <code>${size}</code> см`].join(
				"\n\n"
			),
			{
				parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [[{ text: "История", callback_data: `dick_history_${ctx.from!.id}_1` }]],
				},
			}
		);
	}

	const difference = random(-7, 7, true);

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

	return ctx.api.editMessageText(ctx.chatId!, ctx.msgId!, (await Promise.all(text)).join("\n"), {
		parse_mode: "HTML",
	});
});

dickComposer.callbackQuery(/dick_history_(\d+)_(\d+)/gm, async ctx => {
	const user_id = Number(ctx.callbackQuery.data.split("_")[2]);
	if (ctx.callbackQuery.from!.id !== user_id) return ctx.answerCallbackQuery("Эта кнопка предназначена не вам!");

	const inline_keyboard = ctx.callbackQuery.message?.reply_markup?.inline_keyboard!;
	const totalPagesButton = inline_keyboard[0]!.find(button => button.text.includes("/"));
	const currentPage = Number(totalPagesButton?.text.split("/")[0]);
	const page = Number(ctx.callbackQuery.data.split("_")[3]);

	if (currentPage == page) return ctx.answerCallbackQuery("Вы уже в этой странице!");

	const dick_history = await ctx.database.resolveDickHistory(ctx.callbackQuery.from, true);
	const pagesLength = Math.ceil(dick_history.length / 10);

	const history = dick_history
		.slice(page * 10 - 10 + (page > 1 ? 1 : 0), page * 10)
		.map(({ size, difference, created_at }, index) => {
			return [
				`${page * 10 - 10 + index + 1}) <code>${moment(created_at).utc(false).format("DD.MM.YYYY HH:mm")} UTC</code>`,
				`• Получено: <code>${difference}</code>`,
				`• Всего: <code>${size + difference}</code>`,
			].join("\n");
		});

	const keyboard: InlineKeyboardButton[][] = [[]];

	if (page > 1)
		keyboard[0]?.push({
			callback_data: `dick_history_${user_id}_${page - 1}`,
			text: `Назад`,
		});

	keyboard[0]?.push({
		callback_data: `dick_history_${user_id}_${page}`,
		text: `${page}/${pagesLength}`,
	});

	if (page < pagesLength)
		keyboard[0]?.push({
			callback_data: `dick_history_${user_id}_${page + 1}`,
			text: `Вперёд`,
		});

	return ctx.api.editMessageText(ctx.chatId!, ctx.msgId!, history.join("\n\n"), {
		parse_mode: "HTML",
		reply_markup: { inline_keyboard: keyboard },
	});
});
