import { Composer } from "grammy";
import type { InlineKeyboardButton } from "grammy/types";
import { roles } from "i18n/formatters";
import type { Context } from "../utils/context";

export const userinfoComposer = new Composer<Context>();
const dateFormatter = new Intl.DateTimeFormat("ru");

const discordRegex = /discord_[a-zA-Z0-9]{2,32}/gm;
const steamRegex = /(?:https?:\/\/)?steamcommunity\.com\/(?:profiles|id)\/[a-zA-Z0-9]+/gm;
const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_]{1,25}$/gm;

userinfoComposer.command("userinfo", async ctx => {
	const msdbot_user = await ctx.database.resolveUser({ id: ctx.from!.id }, true);
	const msdbot_buttons = await ctx.database.resolveUserButtons({ id: ctx.from!.id });

	const { first_name, last_name, username, id: user_id } = ctx.from!;
	const { id, created_at, status } = msdbot_user!;
	const buttons: InlineKeyboardButton[][] = [];

	buttons.push([
		{
			text: ctx.t.userinfo_refferal_button({ emoji: "👥" }),
			copy_text: {
				text: `https://t.me/${ctx.me.username}?start=ref_${user_id}`,
			},
		},
	]);

	msdbot_buttons.map(({ link, text }) => {
		if (!link && text?.match(discordRegex))
			buttons.push([{ text: "Discord", copy_text: { text: text!.slice("discord_".length) } }]);
		if (link?.match(steamRegex)) buttons.push([{ text: "Steam", url: link!.match(steamRegex)![0] }]);
		if (link?.match(githubRegex)) buttons.push([{ text: "GitHub", url: link!.match(githubRegex)![0] }]);
	});

	// buttons.push([
	// 	{ text: ctx.t.userinfo_add_button({ emoji: "➕" }), callback_data: "userinfo_add_button" },
	// 	{ text: ctx.t.userinfo_delete_button({ emoji: "🗑️" }), callback_data: "userinfo_delete_button" },
	// ]);

	return ctx.reply(
		ctx.t.userinfo({
			user_id,
			first_name,
			last_name: last_name ?? "Нету",
			username: username ?? "Нету",
			fullname: first_name + (last_name ? ` ${last_name}` : ""),
			id,
			created_at: dateFormatter.format(created_at),
			status: roles[status],
		}),
		{
			reply_markup: {
				inline_keyboard: buttons,
			},
		}
	);
});
