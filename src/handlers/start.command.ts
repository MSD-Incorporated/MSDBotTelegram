import { InlineKeyboard, type Context } from "grammy";

const version = process.env.npm_package_version;

export const startCommand = async (ctx: Context) => {
	return ctx.reply(["Добро пожаловать!", `Текущий билд: <code>${version}</code>`].join("\n\n"), {
		parse_mode: "HTML",
		reply_markup: new InlineKeyboard().add({
			text: "🔗 • Github",
			url: "https://github.com/MSD-Incorporated/MSDBotTelegram",
		}),
	});
};
