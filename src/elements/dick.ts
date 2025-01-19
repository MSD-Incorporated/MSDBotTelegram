import { dicks } from "drizzle";
import { asc, desc } from "drizzle-orm";
import { Composer } from "grammy";
import type { InlineKeyboardButton } from "grammy/types";
import { code, random, type Context } from "../utils";

const timeout = 12 * 60 * 60 * 1000;
const dateFormatter = new Intl.DateTimeFormat("ru", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
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
		const timeLeft = dateFormatter.format(timeout - lastUsed).slice(12);
		const { dick_timeout_text, dick_history_button } = ctx.t;

		return ctx.reply(dick_timeout_text({ timeLeft, size }), {
			reply_markup: {
				inline_keyboard: [[{ text: dick_history_button(), callback_data: `dick_history_${user.id}_1` }]],
			},
		});
	}

	const difference = random(-7, 7, true);

	await ctx.database.updateDick(user, { size: size + difference, timestamp: new Date(now) });
	await ctx.database.writeDickHistory({ id: user.id, size, difference });

	return ctx.reply(ctx.t.dick_success_text({ phrase: getPhrase(difference), current_size: size + difference }));
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

const keyboardBuilder = (ctx: Context, name: string, page: number, sub_name: string, totalPages: number) => {
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

dickComposer.callbackQuery(/leaderboard_(asc|desc)_(\d+)/, async ctx => {
	const inline_keyboard = ctx.msg?.reply_markup?.inline_keyboard!;
	const totalPagesButton = inline_keyboard[0]!.find(button => button.text.includes("/"));
	const currentPage = Number(totalPagesButton?.text.split("/")[0]);
	const page = Number(ctx.callbackQuery.data.split("_")[2]);

	if (currentPage == page) return ctx.answerCallbackQuery(ctx.t.keyboard_same_page());

	const type = ctx.callbackQuery.data.includes("leaderboard_asc") ? "asc" : "desc";
	const allUsers = await ctx.database.db
		.select({ user_id: dicks.user_id, size: dicks.size })
		.from(dicks)
		.orderBy(({ size }) => (type === "asc" ? asc(size) : desc(size)));
	if (allUsers.length <= 0) return ctx.reply(ctx.t.dick_leaderboard_empty());

	const pagesLength = Math.ceil(allUsers.length / 10);
	const text = allUsers
		.slice(Math.max(page * 10 - 10, 0), Math.min(page * 10, allUsers.length))
		.map(async ({ user_id, size }, index) => {
			const user_data = (await ctx.database.resolveUser({ id: user_id }, true))!;
			const name = user_data.first_name + (user_data?.last_name == undefined ? "" : ` ${user_data.last_name}`);

			return ctx.t.dick_leaderboard_user({ rank: page * 10 - 10 + index + 1, name, size });
		});

	const keyboard = keyboardBuilder(ctx, "leaderboard", page, type, pagesLength);

	return ctx.api.editMessageText(ctx.chatId!, ctx.msgId!, (await Promise.all(text)).join("\n"), {
		reply_markup: { inline_keyboard: keyboard },
	});
});

dickComposer.callbackQuery(/dick_history_(\d+)_(\d+)/gm, async ctx => {
	const user_id = Number(ctx.callbackQuery.data.split("_")[2]);
	if (ctx.callbackQuery.from!.id !== user_id) return ctx.answerCallbackQuery(ctx.t.keyboard_wrong_user());

	const inline_keyboard = ctx.msg?.reply_markup?.inline_keyboard!;
	const totalPagesButton = inline_keyboard[0]!.find(button => button.text.includes("/"));
	const currentPage = Number(totalPagesButton?.text.split("/")[0]);
	const page = Number(ctx.callbackQuery.data.split("_")[3]);

	if (currentPage == page) return ctx.answerCallbackQuery(ctx.t.keyboard_same_page());

	const dick_history = await ctx.database.resolveDickHistory(ctx.callbackQuery.from, true);
	if (dick_history.length <= 0) return ctx.reply(ctx.t.dick_history_empty());

	const pagesLength = Math.ceil(dick_history.length / 10);
	const history = dick_history
		.reverse()
		.slice(Math.max(page * 10 - 10, 0), Math.min(page * 10, dick_history.length))
		.map(({ size, difference, created_at }, index) => {
			return ctx.t.dick_history_user({
				rank: page * 10 - 10 + index + 1,
				date: dateFormatter.format(created_at).slice(0, 17),
				difference,
				total: size + difference,
			});
		});

	const keyboard = keyboardBuilder(ctx, "dick_history", page, "user_id", pagesLength);

	return ctx.api.editMessageText(ctx.chatId!, ctx.msgId!, history.join("\n\n"), {
		reply_markup: { inline_keyboard: keyboard },
	});
});
