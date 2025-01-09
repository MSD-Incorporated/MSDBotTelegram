import { Composer } from "grammy";
import { roles } from "i18n/formatters";
import type { Context } from "../utils/context";

export const userinfoComposer = new Composer<Context>();
const dateFormatter = new Intl.DateTimeFormat("ru");

userinfoComposer.command("userinfo", async ctx => {
	const msdbot_user = await ctx.database.resolveUser({ id: ctx.from!.id }, true);

	const { first_name, last_name, username, id: user_id } = ctx.from!;
	const { id, created_at, status } = msdbot_user!;

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
				inline_keyboard: [
					[
						{
							text: ctx.t.userinfo_refferal_button({ emoji: "👥" }),
							copy_text: {
								text: `https://t.me/${ctx.me.username}?start=ref_${user_id}`,
							},
						},
					],
				],
			},
		}
	);
});
