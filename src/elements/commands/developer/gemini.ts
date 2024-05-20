import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import type { Context } from "grammy";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

console.log(process.env);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const allowedUsers: number[] = [946070039, 629401289, 654382771, 954735954];
const allowedChats: number[] = [-1001705068191, -1001860827131];

const parser = (str: string) => {
	if (str.match(/^```(.*)\n([\s\S]*?)```$/gm)) {
		const language = str.split(/\s+/)[0]!.slice(3);

		str = str.replace(
			/^```(.*)\n([\s\S]*?)```$/gm,
			`<pre><code class="language-${language.replace("c#", "csharp").replace("c++", "cpp")}">${str
				.slice(3 + language.replace("c#", "csharp").replace("c++", "cpp").length, str.length - 3)
				.replace(/\</gm, "&lt;")
				.replace(/\>/gm, "&gt;")}</code></pre>`
		);
	}

	return str.replace(/\*\*(.*)\*\*/gm, "<b>$1</b>").replace(/\*(.*)\*/gm, "<b>$1</b>");
};

export const geminiCommand = async (ctx: Context) => {
	if (!allowedChats.includes(ctx.chat!.id)) {
		if (!allowedUsers.includes(ctx.from!.id)) return;
	}

	const args = ctx.message?.text?.split(/\s+/).slice(1);
	if (!args?.length) return ctx.reply("Не удалось найти запрос");

	const msg = await ctx.reply("Подождите, ответ генерируется...");

	const result = await model.generateContent(args.join(" "));
	const response = result.response;
	const text = response.text();

	await ctx.api.editMessageText(msg.chat.id, msg.message_id, parser(text), {
		parse_mode: "HTML",
	});
};
