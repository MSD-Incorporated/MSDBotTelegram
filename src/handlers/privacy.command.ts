import type { Context } from "grammy";

const privacyLink = "https://telegra.ph/Politika-konfidencialnosti-dlya-telegram-bota-masedmsd-bot-07-05";

export const privacyCommand = async ({ reply }: Context) => {
	return reply(`<a href="${privacyLink}">Политика конфиденциальности</a>`, {
		parse_mode: "HTML",
	});
};
