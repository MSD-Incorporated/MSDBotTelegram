import type { Context } from "grammy";
import { DEVELOPERS } from "../../../config";
import type { Client } from "../../../structures";

const getCleaned = async (text: string) => {
	if (text && text.constructor.name == "Promise") text = await text;
	if (typeof text !== "string") text = require("util").inspect(text, { depth: 1 });
	text = text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	return text;
}

// @ts-ignore
export const evalCommand = async (ctx: Context, client: Client) => {
	if (!(Array.isArray(DEVELOPERS) ? DEVELOPERS.includes(ctx.from?.id) : DEVELOPERS === ctx.from?.id)) return;

	const args = ctx.message?.text?.split(/\s+/).slice(1);
	if (!args?.length) return ctx.reply("Не удалось найти команду");

	const evaled = eval(args.join(" "));
	const cleaned = await getCleaned(evaled);
	const tokenFormatted = cleaned.replaceAll(process.env.TOKEN, "****");

	return ctx.reply(
		`<pre><code className="language-javascript">${tokenFormatted}</code></pre>`,
		{
			parse_mode: "HTML",
			reply_parameters: { message_id: ctx.message!.message_id },
		}
	);
}