import { execSync } from "child_process";
import { InlineKeyboard, type Context } from "grammy";
import { resolve } from "path";

const version = require(resolve(process.cwd(), "package.json")).version;
const rev = execSync("git rev-parse --short HEAD").toString().trim();

export const startCommand = async (ctx: Context) => {
	return ctx.reply(
		[
			"🧑‍💻 • Ведётся разработка",
			`Текущий билд: <code>${version}</code> [<code>${rev}]</code>`,
		].join("\n\n"),
		{
			parse_mode: "HTML",
			reply_parameters: { message_id: ctx.message!.message_id },
			reply_markup: new InlineKeyboard().add({
				text: "🔗 • Github",
				url: "https://github.com/MSD-Incorporated/MSDBotTelegram",
			}),
		}
	);
};
