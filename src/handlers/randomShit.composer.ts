import { Composer } from "grammy";

export const randomShitComposer = new Composer();

randomShitComposer.on("message:text", async (ctx, next) => {
	await next();

	if (ctx.message.from.is_bot) return;
	if (Math.random() < 0.01) return ctx.react("👀");
});

randomShitComposer.on("::mention", ctx => {
	if (ctx.message?.text == `@${ctx.me.username}`) return ctx.reply("Я тут!");
});
