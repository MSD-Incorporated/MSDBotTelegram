import { Composer, InputFile } from "grammy";

import type { Context } from "../utils";
import image from "./image.png" with { type: "file" };

export const extraComposer = new Composer<Context>();

extraComposer
	.filter(({ from }) => from !== undefined && !from.is_bot && Math.random() < 0.01)
	.on("message:text", async (ctx, next) => {
		await next();

		return ctx.react("👀");
	});

extraComposer
	.filter(({ message, me }) => message !== undefined && message.text === `@${me.username}`)
	.on("::mention", async (ctx, next) => {
		await next();

		return ctx.replyWithPhoto(new InputFile(await Bun.file(image).bytes()), {
			caption: ctx.t.im_here(),
		});
	});
