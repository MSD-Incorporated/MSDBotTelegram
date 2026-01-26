import { and, count, countDistinct, dick_history, eq, gte, referrals } from "@msdbot/database";
import { bold, boldAndTextLink, code, premium_emoji, type TranslationFunctions } from "@msdbot/i18n";
import { sleep } from "bun";
import { Composer } from "grammy";
import type { InlineKeyboardButton } from "grammy/types";
import { randomInt } from "node:crypto";

import { dateFormatter, formatTime, isSubscriber, keyboardBuilder, normalizeName, type Context } from "../utils";

export const dickComposer = new Composer<Context>();
export const timeout: number = 2 * 60 * 60 * 1000;
export const referral_timeout: number = 24 * 60 * 60 * 1000;

const getPhrase = (difference: number, t: TranslationFunctions) => {
	if (difference < 0)
		return {
			text: t.dick_decreased({ difference: difference.toString().slice(1) }),
			emoji: premium_emoji("📉", "5246762912428603768"),
		};
	if (difference > 0)
		return {
			text: t.dick_increased({ difference: difference.toString() }),
			emoji: premium_emoji("📈", "5244837092042750681"),
		};
	return { text: t.dick_not_changed(), emoji: premium_emoji("😔", "5370781385885751708") };
};

dickComposer.chatType(["group", "supergroup", "private"]).command(["dick", "cock"], async ctx => {
	const { size, timestamp } = await ctx.database.dicks.resolve(ctx.from, {
		columns: { size: true, timestamp: true },
		createIfNotExist: true,
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

	let min = -20;
	let max = 20;
	const scalingStep = 25;

	if (size < 0) {
		const bonus = Math.floor(Math.abs(size) / scalingStep);
		min -= bonus;
	}

	if (size > 0) {
		const bonus = Math.floor(size / scalingStep);
		max += bonus;
	}

	const difference = randomInt(min, max + 1);
	const newSize = size + difference;

	await ctx.database.dicks.update(ctx.from, { size: newSize, timestamp: new Date() });
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

	return ctx.reply(dick_leaderboard_choose_text({ emoji: premium_emoji("📊", "5231200819986047254") }), {
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
	.filter(
		({ chat }) =>
			chat !== undefined && (chat.id === -1001705068191 || chat.id === -1002299010777 || chat.id === 946070039)
	)
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
				await ctx.database.dicks.update(ctx.from, { size: size + -1 * Number(balance) });
				return ctx.reply(bold(`${premium_emoji("😔", "5370781385885751708")} Вы не угадали...`, false));
			}

			await ctx.database.dicks.update(ctx.from, { size: size - -1 * Number(balance) * 2 });
			return ctx.reply(
				[
					bold(`${premium_emoji("🤑", "5373303394976929925")} Вы угадали!\n`, false),
					bold(`• Ваш текущий размер pp: `) + `${code(size - -1 * Number(balance) * 2)}` + bold(` см`),
					bold(`• Ваша ставка была: `) + `${code(balance)}` + bold(` см`),
				].join("\n")
			);
		}

		if (size > 0) {
			if (size < Number(balance) || Number(balance) < 0)
				return ctx.reply(bold(`Ваш pp больше чем вы можете поставить`));

			const { dice } = await ctx.replyWithDice("🎲");
			await sleep(3000);

			if (Number(diceGuess) !== dice.value) {
				await ctx.database.dicks.update(ctx.from, { size: size - Number(balance) });
				return ctx.reply(bold("😔 Вы не угадали"));
			}

			await ctx.database.dicks.update(ctx.from, { size: size + Number(balance) * 2 });
			return ctx.reply(
				[
					bold("🤑 Вы угадали!\n"),
					`• Ваш текущий размер pp: ${code(size + Number(balance) * 2)} см`,
					`• Ваша ставка была: ${code(balance)} см`,
				].join("\n")
			);
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

dickComposer
	.chatType(["group", "supergroup", "private"])
	.command(["referrals", "referals", "ref", "refs", "referral"], async ctx => {
		const [refs] = await ctx.database.db
			.select({ count: count() })
			.from(referrals)
			.where(eq(referrals.referrer, ctx.from.id));

		const [activeRefs] = await ctx.database.db
			.select({ count: countDistinct(referrals) })
			.from(referrals)
			.innerJoin(dick_history, eq(referrals.referral, dick_history.user_id))
			.where(
				and(
					eq(referrals.referrer, ctx.from.id),
					gte(dick_history.created_at, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
				)
			);

		const isSubscribed = await isSubscriber(ctx, -1002336315136);
		const value = (activeRefs?.count ?? 0) + Number(isSubscribed) * 3;
		const { referral_timestamp } = await ctx.database.dicks.resolve(ctx.from, {
			columns: { referral_timestamp: true },
		});

		const text = [
			bold(`${premium_emoji("📊", "5231200819986047254")} Ваша реферальная статистика:\n`, false),
			bold(`${premium_emoji("👥", "5372926953978341366")} Рефералов: `, false) + code(refs?.count ?? 0),
			bold(`${premium_emoji("🤑", "5373303394976929925")} Активных: `, false) + code(activeRefs?.count ?? 0),
			bold(`${premium_emoji("🗳️", "5359741159566484212")} Подписаны на `, false) +
				boldAndTextLink("канал", "https://t.me/msdbot_information") +
				bold(":") +
				code(isSubscribed ? " да" : " нет"),
			bold("\nЗа подписку на канал вы можете получить 3 см."),
			bold("А за каждого реферала ещё по сантиметру!\n"),
			bold("Всё это суммируется и вы можете получить в ту сторону, в какую захотите (плюс или минус)"),
		].join("\n");

		const now = Date.now();
		const lastUsed = now - referral_timestamp.getTime();

		if (lastUsed < referral_timeout) {
			const timeLeft = formatTime(referral_timeout - lastUsed);

			return ctx.reply(
				ctx.t.dick_referral_timeout_text({
					timeLeft,
					referrals: activeRefs?.count ?? 0,
					isSubscribed: isSubscribed ? "да" : "нет",
				}),
				{
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "🔗 Скопировать ссылку",
									copy_text: { text: `https://t.me/${ctx.me.username}?start=ref_${ctx.from.id}` },
								},
							],
						],
					},
				}
			);
		}

		const keyboard: InlineKeyboardButton[][] = [[], []];

		if (value !== 0) {
			keyboard[0]?.push({
				text: `➖ Убрать ${value} см`,
				callback_data: `referrals_${ctx.from.id}_remove_${value}`,
			});

			keyboard[0]?.push({
				text: `➕ Добавить ${value} см`,
				callback_data: `referrals_${ctx.from.id}_add_${value}`,
			});

			keyboard[1]?.push({
				text: "🔗 Скопировать ссылку",
				copy_text: {
					text: `https://t.me/${ctx.me.username}?start=ref_${ctx.from.id}`,
				},
			});
		}

		if (value == 0) {
			keyboard[0]?.push({
				text: "🔗 Скопировать ссылку",
				copy_text: {
					text: `https://t.me/${ctx.me.username}?start=ref_${ctx.from.id}`,
				},
			});
		}

		return ctx.reply(text, { reply_markup: { inline_keyboard: keyboard } });
	});

dickComposer
	.chatType(["group", "supergroup", "private"])
	.callbackQuery(/referrals_(\d+)_(remove|add)_(\d+)/, async ctx => {
		const type: "add" | "remove" = ctx.callbackQuery.data.split("_")[2] as "add" | "remove";
		const value: number = Number(ctx.callbackQuery.data.split("_")[3]);

		if (ctx.from.id !== Number(ctx.callbackQuery.data.split("_")[1]))
			return ctx.answerCallbackQuery(ctx.t.keyboard_wrong_user());

		const { size, referral_timestamp } = await ctx.database.dicks.resolve(ctx.from, {
			columns: { size: true, referral_timestamp: true },
		});

		const now = Date.now();
		const lastUsed = now - referral_timestamp.getTime();

		if (lastUsed < referral_timeout) {
			const timeLeft = formatTime(referral_timeout - lastUsed);
			const [activeRefs] = await ctx.database.db
				.select({ count: countDistinct(referrals) })
				.from(referrals)
				.innerJoin(dick_history, eq(referrals.referral, dick_history.user_id))
				.where(
					and(
						eq(referrals.referrer, ctx.from.id),
						gte(dick_history.created_at, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
					)
				);

			return ctx.answerCallbackQuery(
				ctx.t.dick_referral_timeout_text({
					timeLeft,
					referrals: activeRefs?.count ?? 0,
					isSubscribed: (await isSubscriber(ctx, -1002336315136)) ? "да" : "нет",
				})
			);
		}

		await ctx.database.dicks.update(ctx.from, {
			size: type == "add" ? size + value : size - value,
			referral_timestamp: new Date(Date.now()),
		});

		await ctx.database.dicks.addHistory(ctx.from, size, type == "add" ? value : Number(`-${value}`));

		return ctx.editMessageText(
			ctx.t.dick_referral_success({ type: type == "add" ? "увеличили" : "уменьшили", value })
		);
	});

dickComposer.chatType(["group", "supergroup", "private"]).command("send", async ctx => {
	const [userToSendMention, amount]: string[] = ctx.match.split(" ");

	if (userToSendMention === undefined || amount === undefined || isNaN(Number(amount)))
		return ctx.reply(bold(`Неправильный ввод чисел, должно быть:\n`) + code(`/send <пользователь> <сумма>`));

	const { size } = await ctx.database.dicks.resolve(ctx.from, { createIfNotExist: true, columns: { size: true } });
	if (size === 0) return ctx.reply(bold("🥲 У вас нулевой размер pp"));

	const userToSend = (
		isNaN(Number(userToSendMention))
			? await ctx.database.users.find(
					{ username: userToSendMention },
					{ columns: { id: true, first_name: true, last_name: true } }
				)
			: await ctx.database.users.find(
					{ id: Number(userToSendMention) },
					{ columns: { id: true, first_name: true, last_name: true } }
				)
	)!;

	const userToSendDick = await ctx.database.dicks.resolve(userToSend, {
		createIfNotExist: false,
		columns: { size: true },
	});

	if (!userToSendDick) return ctx.reply(bold(`Пользователь ${userToSendMention} не найден`));

	if (Number(amount) === 0) return ctx.reply("Рофлишь?");

	if (size < 0) {
		if (Number(amount) > 0 || size > Number(amount)) return ctx.reply(bold(`Ваш pp меньше чем вы можете отдать`));
		if (userToSendDick.size > 0)
			return ctx.reply("Вы не можете передать отрицательный размер pp пользователю с положительным pp");

		await ctx.database.dicks.update(ctx.from, { size: size + -1 * Number(amount) });
		await ctx.database.dicks.update(userToSend, { size: userToSendDick.size - -1 * Number(amount) });

		return ctx.reply(
			`Вы успешно передали ${amount} см пользователю ${boldAndTextLink(normalizeName(userToSend), `tg://openmessage?user_id=${userToSend.id}`)}`
		);
	}

	if (size > 0) {
		if (size < Number(amount) || Number(amount) < 0) return ctx.reply(bold(`Ваш pp больше чем вы можете отдать`));
		if (userToSendDick.size < 0)
			return ctx.reply("Вы не можете передать положительный размер pp пользователю с отрицательным pp");

		await ctx.database.dicks.update(ctx.from, { size: size - Number(amount) });
		await ctx.database.dicks.update(userToSend, { size: userToSendDick.size + Number(amount) });

		return ctx.reply(
			`Вы успешно передали ${amount} см пользователю ${boldAndTextLink(normalizeName(userToSend), `tg://openmessage?user_id=${userToSend.id}`)}`
		);
	}
});
