import { asc, desc } from "drizzle-orm";
import { Composer } from "grammy";
import type { InlineKeyboardButton } from "grammy/types";

import { dicks } from "../drizzle";
import type { TranslationFunctions } from "../i18n/i18n-types";

import {
	code,
	dateFormatter,
	daysUntilEvent,
	formatTime,
	isSubscriber,
	keyboardBuilder,
	random,
	referral_timeout,
	timeout,
	type Context,
} from "../utils";

export const dickComposer = new Composer<Context>();

const getPhrase = (difference: number, t: TranslationFunctions) => {
	if (difference < 0) return t.dick_decreased({ difference: difference.toString().slice(1) });
	if (difference > 0) return t.dick_increased({ difference: difference.toString() });
	return t.dick_not_changed();
};

dickComposer.command(["dick", "cock"], async ctx => {
	const user = ctx.from!;
	const { size, timestamp } = await ctx.database.resolveDick(user, true);

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

	const difference = random(-12, 12, true);

	await ctx.database.updateDick(user, { size: size + difference, timestamp: new Date(now) });
	await ctx.database.writeDickHistory({ id: user.id, size, difference });

	return ctx.reply(
		ctx.t.dick_success_text({ phrase: getPhrase(difference, ctx.t), current_size: size + difference })
	);
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

dickComposer.callbackQuery(/leaderboard_(asc|desc)_(\d+)/, async ctx => {
	const inline_keyboard = ctx.msg!.reply_markup?.inline_keyboard!;
	const totalPagesButton = inline_keyboard[0]!.find(button => button.text.includes("/"));

	const currentPage = Number(totalPagesButton?.text.split("/")[0]);
	const page = Number(ctx.callbackQuery.data.split("_")[2]);

	if (currentPage == page) return ctx.answerCallbackQuery(ctx.t.keyboard_same_page());

	const type = ctx.callbackQuery.data.includes("leaderboard_asc") ? "asc" : "desc";
	const allUsers = await ctx.database.db
		.select({ user_id: dicks.user_id, size: dicks.size })
		.from(dicks)
		.orderBy(({ size }) => (type === "asc" ? asc(size) : desc(size)));

	if (allUsers.length === 0) return ctx.answerCallbackQuery(ctx.t.dick_leaderboard_empty());

	const pagesLength = Math.ceil(allUsers.length / 10);
	const text = allUsers
		.slice(Math.max(page * 10 - 10, 0), Math.min(page * 10, allUsers.length))
		.map(async ({ user_id, size }, index) => {
			const user_data = (await ctx.database.resolveUser({ id: user_id }))!;
			const name = user_data.first_name + (user_data?.last_name == undefined ? "" : ` ${user_data.last_name}`);

			return ctx.t.dick_leaderboard_user({ rank: page * 10 - 10 + index + 1, name, size });
		});

	const keyboard = keyboardBuilder(ctx, "leaderboard", page, type, pagesLength);

	return ctx.api
		.editMessageText(ctx.chatId!, ctx.msgId!, (await Promise.all(text)).join("\n"), {
			reply_markup: { inline_keyboard: keyboard },
		})
		.catch(err => console.error(err));
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
	if (dick_history.length <= 0) return ctx.answerCallbackQuery(ctx.t.dick_history_empty());

	const pagesLength = Math.ceil(dick_history.length / 10);
	const history = dick_history
		.reverse()
		.slice(Math.max(page * 10 - 10, 0), Math.min(page * 10, dick_history.length))
		.map(({ size, difference, created_at }, index) => {
			return ctx.t.dick_history_user({
				rank: page * 10 - 10 + index + 1,
				date: dateFormatter.format(created_at!).slice(0, 17),
				difference,
				total: size + difference,
			});
		});

	const keyboard = keyboardBuilder(ctx, "dick_history", page, user_id.toString(), pagesLength);

	return ctx.api.editMessageText(ctx.chatId!, ctx.msgId!, history.join("\n\n"), {
		reply_markup: { inline_keyboard: keyboard },
	});
});

dickComposer.command(["referrals", "referals", "ref", "refs", "referral"], async ctx => {
	const user = ctx.from!;
	const isSubscribed = await isSubscriber(ctx, user.id, -1002336315136);

	const referrals = await ctx.database.resolveReferrals(user, { referrer: { with: { dick: true } } });
	const active_referrals = referrals.filter(
		({ referrer }) => referrer && referrer.dick && daysUntilEvent(referrer.dick.updated_at!, new Date()) <= 30
	);

	const value = active_referrals.length + Number(isSubscribed);

	const { referral_timestamp } = await ctx.database.resolveDick(user, true);

	const now = Date.now();
	const lastUsed = now - referral_timestamp.getTime();

	if (lastUsed < referral_timeout) {
		const timeLeft = formatTime(referral_timeout - lastUsed);

		return ctx.reply(ctx.t.dick_referral_timeout_text({ timeLeft, referrals: active_referrals.length }), {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: ctx.t.userinfo_refferal_button({ emoji: "👥" }),
							copy_text: {
								text: `https://t.me/${ctx.me.username}?start=ref_${user.id}`,
							},
						},
					],
				],
			},
		});
	}

	const keyboard: InlineKeyboardButton[][] = [[], []];

	if (value !== 0) {
		keyboard[0]?.push({
			text: `➖ Убрать ${value} см`,
			callback_data: `referrals_${user.id}_remove_${value}`,
		});

		keyboard[0]?.push({
			text: `➕ Добавить ${value} см`,
			callback_data: `referrals_${user.id}_add_${value}`,
		});

		keyboard[1]?.push({
			text: ctx.t.userinfo_refferal_button({ emoji: "👥" }),
			copy_text: {
				text: `https://t.me/${ctx.me.username}?start=ref_${user.id}`,
			},
		});
	}

	if (value == 0) {
		keyboard[0]?.push({
			text: ctx.t.userinfo_refferal_button({ emoji: "👥" }),
			copy_text: {
				text: `https://t.me/${ctx.me.username}?start=ref_${user.id}`,
			},
		});
	}

	return ctx.reply(
		ctx.t.dick_refferal_text({
			canGet:
				value == 0
					? `Вы не можете получить ни одного дополнительного сантиметра`
					: `Вы можете получить ${code(`${value}`)} см!`,
			isSubscribed: isSubscribed ? "Да" : "Нет",
			active_referrals_count: active_referrals.length,
			referrals_count: referrals.length,
		}),
		{ reply_markup: { inline_keyboard: keyboard }, link_preview_options: { is_disabled: true } }
	);
});

dickComposer.callbackQuery(/referrals_(\d+)_(remove|add)_(\d+)/, async ctx => {
	const user = ctx.from;
	const type: "add" | "remove" = ctx.callbackQuery.data.split("_")[2] as "add" | "remove";
	const value: number = Number(ctx.callbackQuery.data.split("_")[3]);

	if (user.id !== Number(ctx.callbackQuery.data.split("_")[1]))
		return ctx.answerCallbackQuery(ctx.t.keyboard_wrong_user());

	const { size, referral_timestamp } = await ctx.database.resolveDick(user, true);

	const now = Date.now();
	const lastUsed = now - referral_timestamp.getTime();

	if (lastUsed < referral_timeout) {
		const timeLeft = formatTime(referral_timeout - lastUsed);
		const referrals = await ctx.database.resolveReferrals(user);

		return ctx.answerCallbackQuery(ctx.t.dick_referral_timeout_text({ timeLeft, referrals: referrals.length }));
	}

	await ctx.database.updateDick(user, {
		size: type == "add" ? size + value : size - value,
		referral_timestamp: new Date(Date.now()),
	});
	await ctx.database.writeDickHistory({ id: user.id, size, difference: type == "add" ? value : Number(`-${value}`) });

	return ctx.editMessageText(ctx.t.dick_referral_success({ type: type == "add" ? "увеличили" : "уменьшили", value }));
});
