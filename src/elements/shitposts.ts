import { checkText } from "@artemis69/yandex-speller";
import { Composer } from "grammy";
import type { Message } from "typegram";
import type { Context } from "../utils";

export const shitpostsComposer = new Composer<Context>();

const channelID = -1002118873453;
const safeWord = (word: string) => word.replace(/</g, "&lt;").replace(/>/g, "&gt;");

shitpostsComposer.on("message", async (ctx, next) => {
	if (!ctx.message.forward_origin || (ctx.message?.forward_origin! as Message)?.chat?.id !== channelID) return next();

	const text = ctx.message.text || ctx.message.caption;
	if (!text) return next();

	const words = await checkText(text, {});
	if (!words.length) return next();

	const rows = text.split("\n");
	const formattedRows = words.map(({ word, s, row }) => {
		const correctedRow = rows[row]?.replace(new RegExp(`${safeWord(word)}\\s`, "gm"), `${safeWord(s[0]!)} `);

		return `Слово <code>${safeWord(word)}</code> должно быть исправлено на <code>${safeWord(s[0]!)}
			\n<pre class="tg-pre-code"><code class="language-diff">- ${rows[row]}
			\n+ ${correctedRow}</code></pre>`;
	});

	const textToSend = formattedRows.join("\n\n");

	return ctx.reply(`<b>Я нашёл возможные ошибки в тексте:</b>\n\n${textToSend}`, { parse_mode: "HTML" });
});
