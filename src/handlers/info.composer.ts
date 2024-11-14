import { Composer, type Context } from "grammy";
import moment from "moment";
import type { Database } from "../structures/database";

export const infoComposer: Composer<Context & { database: Database }> = new Composer();

infoComposer.command(["userinfo", "ui"], async ctx => {
	const user = ctx.msg.from!;
	const { id, first_name, last_name, username, user_id, created_at } = (await ctx.database.resolveUser(user, true))!;

	return ctx.reply(
		[
			`• Имя: <code>${first_name}</code>`,
			`• Фамилия: <code>${last_name || "Нету"}</code>`,
			`• Ник: <code>${username || "Нету"}</code> \n`,
			`• MSD ID: <code>${id}</code>`,
			`• Telegram ID: <code>${user_id}</code> \n`,
			`• Дата регистрации в MSD Ecosystem: <code>${moment(created_at).utc(false).format("DD.MM.YYYY")}</code>`,
		].join("\n"),
		{
			parse_mode: "HTML",
			reply_markup: {
				inline_keyboard:
					user.id == 946070039
						? [
								[
									{
										text: "Github",
										url: "https://github.com/MasedMSD",
									},

									{
										text: "Steam",
										url: "https://steamcommunity.com/id/MasedMSD",
									},
								],
							]
						: [],
			},
		}
	);
});
