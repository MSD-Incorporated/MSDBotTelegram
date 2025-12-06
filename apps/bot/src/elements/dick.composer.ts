import { Composer } from "grammy";
import { randomInt } from "node:crypto";

import { bold, code, type TranslationFunctions } from "@msdbot/i18n";

import { sleep } from "bun";
import { dateFormatter, keyboardBuilder, normalizeName, type Context } from "../utils";

export const dickComposer = new Composer<Context>();
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

dickComposer.chatType(["group", "supergroup", "private"]).command(["lb", "leaderboard"], async ctx => {
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

dickComposer
	.chatType(["group", "supergroup", "private"])
	.filter(({ chat }) => chat !== undefined && chat.id === -1001705068191)
	.command(["roll", "dice", "di"], async ctx => {
		const [balance, diceGuess] = ctx.match.split(" ");

		if (
			balance === undefined ||
			balance === "0" ||
			diceGuess === undefined ||
			typeof Number(balance) !== "number" ||
			typeof Number(diceGuess) !== "number" ||
			isNaN(Number(balance)) ||
			isNaN(Number(diceGuess)) ||
			Number.isInteger(Number(balance)) === false ||
			Number.isInteger(Number(diceGuess)) === false ||
			Number(diceGuess) > 6 ||
			Number(diceGuess) < 1
		)
			return ctx.reply(bold(`Неправильный ввод чисел, должно быть:\n`) + code(`/dice <ставка> <число кубика>`));

		const { size } = await ctx.database.dicks.resolve(ctx.from, {
			createIfNotExist: true,
			columns: { size: true },
		});

		if (size === 0) return ctx.reply(bold("🥲 У вас нулевой размер pp"));

		if (size < 0) {
			if (Number(balance) > 0 || size > Number(balance))
				return ctx.reply(bold(`Ваш pp меньше чем вы можете поставить`));

			const { dice } = await ctx.replyWithDice("🎲");
			await sleep(3000);

			if (Number(diceGuess) !== dice.value) {
				await ctx.database.dicks.update(ctx.from, size + -1 * Number(balance));
				return ctx.reply(bold("😔 Вы не угадали"));
			}

			await ctx.database.dicks.update(ctx.from, size - -1 * Number(balance));
			return ctx.reply(bold("🤑 Вы угадали!"));
		}

		if (size > 0) {
			if (size < Number(balance) || Number(balance) < 0)
				return ctx.reply(bold(`Ваш pp больше чем вы можете поставить`));

			const { dice } = await ctx.replyWithDice("🎲");
			await sleep(3000);

			if (Number(diceGuess) !== dice.value) {
				await ctx.database.dicks.update(ctx.from, size - Number(balance));
				return ctx.reply(bold("😔 Вы не угадали"));
			}

			await ctx.database.dicks.update(ctx.from, size + Number(balance));
			return ctx.reply(bold("🤑 Вы угадали!"));
		}
	});

dickComposer.chatType(["group", "supergroup", "private"]).callbackQuery(/leaderboard_(asc|desc)_(\d+)/, async ctx => {
	const inline_keyboard = ctx.msg!.reply_markup?.inline_keyboard!;
	const totalPagesButton = inline_keyboard[0]!.find(button => button.text.includes("/"));

	const page = Number(ctx.callbackQuery.data.split("_")[2]);
	const currentPage = Number(totalPagesButton?.text.split("/")[0]);
	if (currentPage == page) return ctx.answerCallbackQuery(ctx.t.keyboard_same_page());

	const allUsersCount = await ctx.database.dicks.countLeaderboard();
	if (allUsersCount === 0) return ctx.answerCallbackQuery(ctx.t.dick_leaderboard_empty());

	const type = ctx.callbackQuery.data.includes("leaderboard_asc") ? "asc" : "desc";
	const allUsers = await ctx.database.dicks.getLeaderboard({ limit: 10, offset: (page - 1) * 10, orderBy: type });

	const pagesLength = Math.ceil(allUsersCount / 10);
	const text = allUsers.map(async ({ user_id, size }, index) => {
		const user = (await ctx.database.users.resolve(
			{ id: user_id },
			{ columns: { first_name: true, last_name: true } }
		))!;

		return ctx.t.dick_leaderboard_user({ rank: page * 10 - 10 + index + 1, name: normalizeName(user), size });
	});

	const keyboard = keyboardBuilder(ctx, "leaderboard", page, type, pagesLength);

	return ctx.api
		.editMessageText(
			ctx.chat.id,
			ctx.msgId!,
			(await Promise.all(text)).join("\n") ?? ctx.t.dick_leaderboard_empty(),
			{ reply_markup: { inline_keyboard: keyboard } }
		)
		.catch(err => console.error(err));
});
