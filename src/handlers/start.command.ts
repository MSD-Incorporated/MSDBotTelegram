import { InlineKeyboard, type Context } from "grammy";

const version = (await import(`${process.cwd()}/package.json`)).version;
const bunVersion = Bun.version;

export const startCommand = async (ctx: Context) => {
	return ctx.reply(
		[
			"Добро пожаловать! \n",
			`Текущий билд: <code>${version}</code>`,
			`Версия Bun: <code>${bunVersion}</code>`,
		].join("\n"),
		{
			parse_mode: "HTML",
			reply_markup: new InlineKeyboard().add({
				text: "🔗 • Github",
				url: "https://github.com/MSD-Incorporated/MSDBotTelegram",
			}),
		}
	);
};
