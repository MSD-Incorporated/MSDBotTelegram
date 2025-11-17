import { Composer, InputFile } from "grammy";

import type { Context } from "../utils";
import image from "./image.png" with { type: "file" };

export const extraComposer = new Composer<Context>();
const banner = new InputFile(await Bun.file(image).bytes());

extraComposer
	.chatType(["group", "supergroup", "private"])
	.filter(({ from }) => from !== undefined && !from.is_bot && Math.random() < 0.01)
	.on("message:text", async (ctx, next) => {
		await next();

		return ctx.react("👀");
	});

extraComposer
	.chatType(["group", "supergroup", "private"])
	.filter(({ message, me }) => message !== undefined && message.text === `@${me.username}`)
	.on("::mention", async (ctx, next) => {
		await next();

		return ctx.replyWithPhoto(banner, { caption: ctx.t.im_here() });
	});
