import { asc, desc } from "drizzle-orm";
import { Composer, type Context } from "grammy";
import moment from "moment";
import type { Database } from "structures/database";
import type { InlineKeyboardButton } from "typegram";
import { dicks } from "../drizzle";

const timeout = 12 * 60 * 60;
const random = (min: number, max: number, includeMax?: boolean) =>
	Math.floor(Math.random() * (max - min + 1) + (includeMax ? min : 0));

export const dickComposer: Composer<Context & { database: Database }> = new Composer();

dickComposer.command("dick", async ctx => {
	if (ctx.chat.id == -1001705068191 || ctx.chat.type !== "private")
		return ctx.reply("Пожалуйста, используйте эту команду в личных сообщениях или другом чате!");

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
					{ text: "📈 По возрастанию", callback_data: "leaderboard_asc_1" },
					{ text: "📉 По убыванию", callback_data: "leaderboard_desc_1" },
				],
			],
		},
	});
});

dickComposer.callbackQuery(/leaderboard_(asc|desc)_(\d+)/, async ctx => {
	const inline_keyboard = ctx.callbackQuery.message?.reply_markup?.inline_keyboard!;
	const totalPagesButton = inline_keyboard[0]!.find(button => button.text.includes("/"));
	const currentPage = Number(totalPagesButton?.text.split("/")[0]);
	const page = Number(ctx.callbackQuery.data.split("_")[2]);

	if (currentPage == page) return ctx.answerCallbackQuery("Вы уже в этой странице!");

	const type = ctx.callbackQuery.data.includes("leaderboard_asc") ? "asc" : "desc";
	const allUsers = await ctx.database.db
		.select({ user_id: dicks.user_id, size: dicks.size })
		.from(dicks)
		.orderBy(({ size }) => (type === "asc" ? asc(size) : desc(size)));

	if (allUsers.length < 0) return ctx.reply("Таблица лидеров пуста");

	const pagesLength = Math.ceil(allUsers.length / 10);
	const text = allUsers
		.slice(Math.max(page * 10 - 10, 0), Math.min(page * 10, allUsers.length))
		.map(async ({ user_id, size }, index) => {
			const user_data = (await ctx.database.resolveUser({ id: user_id }, true))!;
			const name = user_data.first_name + (user_data?.last_name == undefined ? "" : ` ${user_data.last_name}`);

			return `<b>${page * 10 - 10 + index + 1}.</b> ${name}: <code>${size}</code> см`;
		});

	const keyboard: InlineKeyboardButton[][] = [[]];

	if (page > 1)
		keyboard[0]?.push({
			callback_data: `leaderboard_${type}_${page - 1}`,
			text: `Назад`,
		});

	keyboard[0]?.push({
		callback_data: `leaderboard_${type}_${page}`,
		text: `${page}/${pagesLength}`,
	});

	if (page < pagesLength)
		keyboard[0]?.push({
			callback_data: `leaderboard_${type}_${page + 1}`,
			text: `Вперёд`,
		});

	return ctx.api.editMessageText(ctx.chatId!, ctx.msgId!, (await Promise.all(text)).join("\n"), {
		parse_mode: "HTML",
		reply_markup: { inline_keyboard: keyboard },
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
		.reverse()
		.slice(Math.max(page * 10 - 10, 0), Math.min(page * 10, dick_history.length))
		.map(({ size, difference, created_at }, index) => {
			return [
				`${page * 10 - 10 + index + 1}. <code>${moment(created_at).utc(false).format("DD.MM.YYYY HH:mm")} UTC</code>`,
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
