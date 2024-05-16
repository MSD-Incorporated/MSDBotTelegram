import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Context } from "grammy";

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

	await ctx.api.editMessageText(msg.chat.id, msg.message_id, text.replace(regex, "\\$1"), {
		parse_mode: "MarkdownV2",
	});
};