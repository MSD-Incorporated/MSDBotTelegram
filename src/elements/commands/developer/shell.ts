import { exec } from "child_process";
import type { Context } from "grammy";
import { DEVELOPERS } from "../../../config";

const codeBlock = (text: string, language?: string) => `\`\`\`${language ?? ""}\n${text}\`\`\``;
const regex = /(\\|_|\*|\[|]|\(|\)|`|~|>|#|\+|-|=|\||\{|}|\.|!)/gm;

export const shellCommand = async (ctx: Context) => {
	if (!(Array.isArray(DEVELOPERS) ? DEVELOPERS.includes(ctx.from?.id) : DEVELOPERS === ctx.from?.id)) return;

	const args = ctx.message?.text?.split(/\s+/).slice(1);
	if (!args?.length) return ctx.reply("Не удалось найти команду");

	exec(args.join(" "), (err, res) => {
		if (err) {
			ctx.reply(`Произошла ошибка: \n\n${codeBlock(err.message.replaceAll(regex, "\\$1"), "bash")}`, {
				parse_mode: "MarkdownV2",
				reply_parameters: { message_id: ctx.message!.message_id },
			});

			return console.error(err);
		}

		ctx.reply(codeBlock(res.replaceAll(regex, "\\$1") || "Нет информации", "bash"), {
			parse_mode: "MarkdownV2",
			reply_parameters: { message_id: ctx.message!.message_id },
		});
	});
};
