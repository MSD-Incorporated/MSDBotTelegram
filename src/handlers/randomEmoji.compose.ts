import { Composer } from "grammy";

export const randomEmojiComposer = new Composer();

randomEmojiComposer.on("message:text", async ctx => {
	if (ctx.message.from.is_bot) return;
	if (Math.random() < 0.09) return ctx.react("👀");
});
