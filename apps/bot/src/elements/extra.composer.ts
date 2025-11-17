import { Composer, InputFile } from "grammy";

import type { Context } from "../utils";

export const extraComposer = new Composer<Context>();

extraComposer.on("message:text", async (ctx, next) => {
	await next();

	if (ctx.message.from.is_bot) return;
	if (Math.random() < 0.01) return ctx.react("👀");
});

extraComposer.on("::mention", async (ctx, next) => {
	await next();

	if (ctx.message?.text == `@${ctx.me.username}`)
		return ctx.replyWithPhoto(new InputFile("./apps/bot/src/elements/image.png"), {
			caption: ctx.t.im_here(),
		});
});
