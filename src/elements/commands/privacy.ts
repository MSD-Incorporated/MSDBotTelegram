import { type Context } from "grammy";

const privacyLink = "https://telegra.ph/Politika-konfidencialnosti-dlya-telegram-bota-masedmsd-bot-07-05";

export const startCommand = async (ctx: Context) => {
	return ctx.reply(privacyLink, {
		reply_parameters: { message_id: ctx.message!.message_id },
	});
};
