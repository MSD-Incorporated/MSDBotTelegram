import { checkText } from "@artemis69/yandex-speller";
import { Composer } from "grammy";
import type { Message } from "typegram";

const channelID = -1002118873453;

export const shitpostsComposer = new Composer();

shitpostsComposer.on("message", async ctx => {
	if (channelID !== (ctx.message?.forward_origin! as Message).chat.id) return;

	const text = ctx.message.text || ctx.message.caption;
	if (!text) return;

	const rows = text.split("\n");
	const words = await checkText(text, {});

	return ctx.reply(
		`<b>Я нашёл возможные ошибки в тексте:</b>\n\n${words
			.map(({ word, s, row }) => {
				return `Слово <code>${word.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code> должно быть исправлено на <code>${s[0]?.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>\n<pre class="tg-pre-code"><code class="language-diff">- ${rows[row]}\n+ ${rows[row]?.replace(word, s[0]!)}</code></pre>`;
			})
			.join("\n\n")}`,
		{
			parse_mode: "HTML",
		}
	);
});
