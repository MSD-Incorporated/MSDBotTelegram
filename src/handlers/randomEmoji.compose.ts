import { Composer } from "grammy";

export const randomEmojiComposer = new Composer();

randomEmojiComposer.on("message:text", async ctx => {
	if (Math.random() < 0.09) ctx.react("👀");
});
