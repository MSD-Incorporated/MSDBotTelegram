import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import type { Context } from "grammy";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

console.log(process.env);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const regex = /(\\|_|\*|\[|]|\(|\)|`|~|>|#|\+|-|=|\||\{|}|\.|!)/gm;
const allowedUsers = [946070039, 629401289, 654382771, 954735954];

export const geminiCommand = async (ctx: Context) => {
	if (!allowedUsers.includes(ctx.from!.id)) return;

	const args = ctx.message?.text?.split(/\s+/).slice(1);
	if (!args?.length) return ctx.reply("Не удалось найти запрос");

	const msg = await ctx.reply("Подождите, ответ генерируется...");

	const result = await model.generateContent(args.join(" "));
	const response = result.response;
	const text = response.text();

	await ctx.api.editMessageText(msg.chat.id, msg.message_id, text, {
		parse_mode: "MarkdownV2",
	});
};
