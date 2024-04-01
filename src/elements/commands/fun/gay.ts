import type { Context } from "grammy";
import { random } from "../../../modules";

export const gayCommand = async (ctx: Context) => {
	const percent = random(-1, 101, true);

	return ctx.reply(
		`🏳️‍🌈 • <a href="tg://user?id=${ctx.from?.id}">${ctx.from?.first_name}</a> гей на <code>${percent}</code>%`,
		{
			parse_mode: "HTML",
			reply_parameters: { message_id: ctx.message!.message_id },
		}
	);
};
