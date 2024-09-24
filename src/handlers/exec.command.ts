import { $ } from "bun";
import type { Context } from "grammy";

export const execCommand = async (ctx: Context) => {
	if (ctx.from!.id !== 946070039) return;

	const prompt = ctx.match?.toString()!;
	const res = await $`${{ raw: prompt }}`.text("utf8");

	return ctx.reply(`<pre class="tg-pre-code">${res}</pre>`, {
		parse_mode: "HTML",
	});
};
