import { and, count, countDistinct, desc, dick_history, eq, gte, inArray, referrals } from "@msdbot/database";
import { bold, boldAndTextLink, code, premium_emoji, type TranslationFunctions } from "@msdbot/i18n";
import { sleep } from "bun";
import { Composer } from "grammy";
import type { InlineKeyboardButton } from "grammy/types";
import { randomInt } from "node:crypto";

import { dateFormatter, formatTime, isSubscriber, keyboardBuilder, normalizeName, type Context } from "../utils";

export const dickComposer = new Composer<Context>();
export const timeout: number = 6 * 60 * 60 * 1000;
export const referral_timeout: number = 24 * 60 * 60 * 1000;

const TYPES = ["dick", "dice", "referral", "transfer"] as const;
const PAGE_SIZE = 10;

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
				inline_keyboard: [
					[
						{
							text: dick_history_button(),
							callback_data: `dick_history_${ctx.from.id}_1_0`,
							icon_custom_emoji_id: "5282843764451195532",
						},
					],
				],
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
	return ctx.reply(ctx.t.dick_success_text({ phrase, emoji, current_size: newSize }), {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: ctx.t.dick_history_button(),
						callback_data: `dick_history_${ctx.from.id}_1_0`,
						icon_custom_emoji_id: "5282843764451195532",
					},
				],
			],
		},
	});
});

dickComposer
	.chatType(["group", "supergroup", "private"])
	.callbackQuery([/^dick_history_(\d+)_(\d+)_(\d+)$/, /^history_filter_(\d+)_(\d+)_(\d+)$/], async ctx => {
		const userId: number = Number(ctx.match[1]);
		let page: number = Number(ctx.match[2]);
		let mask: number = Number(ctx.match[3]);

		if (ctx.callbackQuery.data.startsWith("dick_history")) {
			const match = ctx.callbackQuery.data.match(/^dick_history_(\d+)_(\d+)_(\d+)$/)!;
			page = Number(match[2]);
			mask = Number(match[3]);
		} else {
			const match = ctx.callbackQuery.data.match(/^history_filter_(\d+)_(\d+)_(\d+)$/)!;
			const bit = Number(match[2]);
			const currentMask = Number(match[3]);

			mask = currentMask ^ (1 << bit);
			page = 1;
		}

		let selectedTypes = TYPES.filter((_, i) => (mask >> i) & 1);
		if (selectedTypes.length === 0) selectedTypes = ["dick", "dice", "referral", "transfer"];

		await ctx.answerCallbackQuery();

		const conditions = [eq(dick_history.user_id, userId), inArray(dick_history.type, selectedTypes)];

		const [totalCount] = await ctx.database.db
			.select({ value: count() })
			.from(dick_history)
			.where(and(...conditions));

		const totalPages = Math.ceil((totalCount?.value ?? 0) / PAGE_SIZE);

		const history = await ctx.database.db
			.select()
			.from(dick_history)
			.where(and(...conditions))
			.orderBy(desc(dick_history.created_at))
			.limit(PAGE_SIZE)
			.offset((page - 1) * PAGE_SIZE);

		const text = history.length
			? history
					.map(({ size, difference, created_at, type }, index) => {
						return ctx.t.dick_history_user({
							rank: page * 10 - 10 + index + 1,
							date: dateFormatter.format(created_at!).slice(0, 17),
							difference,
							type: ctx.t.dick_history_types[(type ?? "dick") as keyof typeof ctx.t.dick_history_types](),
							total: size + difference,
						});
					})
					.join("\n\n")
			: "История пуста.";

		const buttons: InlineKeyboardButton[][] = [];

		if (totalPages > 1) {
			const paginationRow: InlineKeyboardButton[] = [];

			if (page > 1)
				paginationRow.push({
					text: "‹ Назад",
					callback_data: `dick_history_${userId}_${page - 1}_${mask}`,
				});

			paginationRow.push({ text: `${page}/${totalPages}`, callback_data: `dick_history_${userId}_${page}_` });

			if (page < totalPages)
				paginationRow.push({
					text: "Вперёд ›",
					callback_data: `dick_history_${userId}_${page + 1}_${mask}`,
				});

			buttons.push(paginationRow);
		}

		buttons.push(
			[
				{
					text: mask & 1 ? "✅ Dick" : "Dick",
					callback_data: `history_filter_${userId}_0_${mask}`,
					style: mask & 1 ? "success" : undefined,
				},
				{
					text: mask & 2 ? "✅ Казино" : "Казино",
					callback_data: `history_filter_${userId}_1_${mask}`,
					style: mask & 2 ? "success" : undefined,
				},
			],
			[
				{
					text: mask & 4 ? "✅ Рефералы" : "Рефералы",
					callback_data: `history_filter_${userId}_2_${mask}`,
					style: mask & 4 ? "success" : undefined,
				},
				{
					text: mask & 8 ? "✅ Переводы" : "Переводы",
					callback_data: `history_filter_${userId}_3_${mask}`,
					style: mask & 8 ? "success" : undefined,
				},
			]
		);

		return ctx.editMessageText(text, { reply_markup: { inline_keyboard: buttons } });
	});

dickComposer.chatType(["group", "supergroup", "private"]).command(["lb", "leaderboard"], async ctx => {
	const { dick_leaderboard_choose_text, dick_leaderboard_ascending_button, dick_leaderboard_descending_button } =
		ctx.t;

	return ctx.reply(dick_leaderboard_choose_text({ emoji: premium_emoji("📊", "5231200819986047254") }), {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: dick_leaderboard_ascending_button(),
						callback_data: "leaderboard_asc_1",
						icon_custom_emoji_id: "5244837092042750681",
					},
					{
						text: dick_leaderboard_descending_button(),
						callback_data: "leaderboard_desc_1",
						icon_custom_emoji_id: "5246762912428603768",
					},
				],
			],
		},
	});
});

dickComposer
	.chatType(["group", "supergroup", "private"])
	.filter(
		({ chat }) =>
			chat !== undefined &&
			(chat.id === -1001705068191 ||
				chat.id === -1002299010777 ||
				chat.id === 946070039 ||
				chat.id === 6545869146)
	)
	.command(["roll", "dice", "di"], async ctx => {
		const [balanceStr, diceGuessStr] = ctx.match.split(" ");
		const balance = Number(balanceStr);
		const diceGuess = Number(diceGuessStr);

		if (
			!balance ||
			!diceGuess ||
			isNaN(balance) ||
			isNaN(diceGuess) ||
			!Number.isInteger(balance) ||
			!Number.isInteger(diceGuess) ||
			diceGuess > 6 ||
			diceGuess < 1
		) {
			return ctx.reply(bold(`Неправильный ввод чисел, должно быть:\n`) + code(`/dice <ставка> <число кубика>`));
		}

		const { size } = await ctx.database.dicks.resolve(ctx.from, {
			createIfNotExist: true,
			columns: { size: true },
		});

		if (size === 0) return ctx.reply(bold("🥲 У вас нулевой размер pp"));

		const isNegative = size < 0;
		if ((isNegative && (balance > 0 || size > balance)) || (!isNegative && (size < balance || balance < 0))) {
			return ctx.reply(bold(`Ваш pp ${isNegative ? "меньше" : "больше"} чем вы можете поставить`));
		}

		const { dice } = await ctx.replyWithDice("🎲");
		await sleep(3000);

		const isWin = diceGuess === dice.value;
		const diff = isWin ? balance * 2 : -balance;

		await ctx.database.dicks.addHistory(ctx.from, size, diff, "dice");
		await ctx.database.dicks.update(ctx.from, { size: size + diff });

		if (!isWin)
			return ctx.reply(
				bold(`${premium_emoji("😔", "5370781385885751708")} Вы не угадали${isNegative ? "..." : ""}`, false)
			);

		return ctx.reply(
			[
				bold(`${premium_emoji("🤑", "5373303394976929925")} Вы угадали!\n`, false),
				bold(`• Ваш текущий размер pp: `) + `${code(size + diff)}` + bold(` см`),
				bold(`• Ваша ставка была: `) + `${code(balance)}` + bold(` см`),
			].join("\n")
		);
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
	const textToSend = await Promise.all(text);

	return ctx.api
		.editMessageText(
			ctx.chat.id,
			ctx.msgId!,
			textToSend.length > 0 ? textToSend.join("\n") : ctx.t.dick_leaderboard_empty(),
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
									text: "Скопировать ссылку",
									icon_custom_emoji_id: "5271604874419647061",
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
				text: `Убрать ${value} см`,
				callback_data: `referrals_${ctx.from.id}_remove_${value}`,
				icon_custom_emoji_id: "5229113891081956317",
			});

			keyboard[0]?.push({
				text: `Добавить ${value} см`,
				callback_data: `referrals_${ctx.from.id}_add_${value}`,
				icon_custom_emoji_id: "5226945370684140473",
			});

			keyboard[1]?.push({
				text: "Скопировать ссылку",
				icon_custom_emoji_id: "5271604874419647061",
				copy_text: {
					text: `https://t.me/${ctx.me.username}?start=ref_${ctx.from.id}`,
				},
			});
		}

		if (value == 0) {
			keyboard[0]?.push({
				text: "Скопировать ссылку",
				icon_custom_emoji_id: "5271604874419647061",
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

		await ctx.database.dicks.addHistory(ctx.from, size, type == "add" ? value : Number(`-${value}`), "referral");

		return ctx.editMessageText(
			ctx.t.dick_referral_success({ type: type == "add" ? "увеличили" : "уменьшили", value })
		);
	});

dickComposer.chatType(["group", "supergroup", "private"]).command("send", async ctx => {
	const target = ctx.message.reply_to_message?.from;
	const amount = Math.floor(Number(ctx.match));

	if (!target || isNaN(amount) || amount <= 0)
		return ctx.reply(
			bold("Использование: ") +
				code("/send <количество>") +
				bold("\nНужно ответить на сообщение того, кому вы хотите передать pp")
		);

	if (target.id === ctx.from.id) return ctx.reply(bold("Вы не можете передать pp самому себе"));
	if (target.is_bot) return ctx.reply(bold("Вы не можете передать pp боту"));

	const sender = await ctx.database.dicks.resolve(ctx.from, { createIfNotExist: true, columns: { size: true } });
	const receiver = await ctx.database.dicks.resolve(target, { createIfNotExist: true, columns: { size: true } });

	const isNegative = sender.size < 0;
	const absSize = Math.abs(sender.size);

	if (absSize < amount) return ctx.reply(bold(`У вас недостаточно pp для передачи (баланс: ${sender.size} см)`));

	const transferValue = isNegative ? -amount : amount;

	await ctx.database.dicks.update(ctx.from, { size: sender.size - transferValue });
	await ctx.database.dicks.update(target, { size: receiver.size + transferValue });

	return ctx.reply(
		bold(`Вы успешно передали `) +
			code(amount) +
			bold(` см pp пользователю `) +
			boldAndTextLink(target.first_name, `tg://user?id=${target.id}`)
	);
});
