import type { NextFunction } from "grammy";
import { normalizeName } from "../utils";
import type { Context } from "./context";

export const commandLogging = async (ctx: Context, next: NextFunction) => {
	await next();

	if (!ctx.message || !ctx.from) return;
	if (!(ctx.message.text || ctx.message.caption)) return;
	if (!(ctx.message.text! || ctx.message.caption!).startsWith("/")) console.log(1);

	const log_string = [
		ctx.logger.ck.grey(`{/}`),
		ctx.logger.ck.greenBright(normalizeName(ctx.from)),
		ctx.logger.ck.grey(`[`) + ctx.logger.ck.greenBright(ctx.from?.id) + ctx.logger.ck.grey(`] used command`),
		ctx.logger.ck.greenBright(ctx.message?.text?.split(" ")[0] ?? ""),
	];

	if (ctx.match && ctx.match.length >= 1) {
		log_string.push(ctx.logger.ck.grey("with args:"), ctx.logger.ck.greenBright(ctx.match));
	}

	ctx.logger.custom(log_string.join(" "));
};

export const buttonLogging = async (ctx: Context, next: NextFunction) => {
	await next();

	if (!ctx.callbackQuery || !ctx.from) return;

	const log_string = [
		ctx.logger.ck.grey(ctx.logger.icons["circle"]),
		ctx.logger.ck.cyanBright(normalizeName(ctx.from)),
		ctx.logger.ck.grey("[") + ctx.logger.ck.cyanBright(ctx.from.id) + ctx.logger.ck.grey("] pressed button"),
		ctx.logger.ck.cyanBright(ctx.callbackQuery.data),
	];

	ctx.logger.custom(log_string.join(" "));
};
