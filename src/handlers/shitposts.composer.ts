import { checkText } from "@artemis69/yandex-speller";
import { Composer } from "grammy";
import type { Message } from "typegram";

const channelID = -1002118873453;

export const shitpostsComposer = new Composer();

const safeWord = (word: string) => word.replace(/</g, "&lt;").replace(/>/g, "&gt;");

shitpostsComposer.on("message", async (ctx, next) => {
	if (!ctx.message.forward_origin) return next();
	if (channelID !== (ctx.message?.forward_origin! as Message).chat.id) return next();

	const text = ctx.message.text || ctx.message.caption;
	if (!text) return next();

	const rows = text.split("\n");
	const words = await checkText(text, {});

	const formattedRows = words.map(({ word, s, row }) => {
		console.log(word, s[0], new RegExp(`${safeWord(word)}.\s`, "gm"));

		return `Слово <code>${safeWord(word)}</code> должно быть исправлено на <code>${safeWord(s[0]!)}</code>\n<pre class="tg-pre-code"><code class="language-diff">- ${rows[row]}\n+ ${rows[row]?.replace(safeWord(word), safeWord(s[0]!))}</code></pre>`;
	});

	const textToSend = [`<b>Я нашёл возможные ошибки в тексте:</b>\n\n`, formattedRows.join("\n\n")].join("");

	return ctx.reply(textToSend, { parse_mode: "HTML" });
});
