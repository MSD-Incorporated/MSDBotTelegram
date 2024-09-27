import { config } from "dotenv";
import type { Context } from "grammy";
import { resolve } from "path";
import { inspect } from "util";

const envs = config({ path: resolve(process.cwd(), ".env") }).parsed!;

const clean = async (text: string | Promise<string>) => {
	if (text && text.constructor.name == "Promise") text = await text;
	if (typeof text !== "string") text = inspect(text, { depth: 1 });

	text = text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

	return text;
};

function getCircularReplacer(): (key: string, value: unknown) => unknown {
	const seen = new WeakSet<object>();

	return (_, value) => {
		if (typeof value !== "object" || value === null) return value;
		if (seen.has(value)) return "[Circular]";

		seen.add(value);

		return value;
	};
}

export const evalCommand = async (ctx: Context) => {
	if (ctx.from!.id !== 946070039) return;

	const prompt = ctx.match?.toString().replace(/(^`{3}(\w+)?|`{3}$)/gm, "")!;
	const res = await eval(await clean(prompt));

	let JSONed = res == undefined ? "Результата нет" : JSON.stringify(res, getCircularReplacer(), 4).slice(0, 4092);

	Object.values(envs).forEach(value => (JSONed = JSONed.replace(new RegExp(value!, "g"), "*".repeat(value!.length))));
	return ctx.reply(`<pre class="tg-pre-code">${JSONed}</pre>`, {
		parse_mode: "HTML",
	});
};
