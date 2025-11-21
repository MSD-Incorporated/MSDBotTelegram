import { Composer } from "grammy";
import type { Context } from "../utils";

export const dickComposer = new Composer<Context>();

dickComposer.chatType(["group", "supergroup", "private"]).command(["dick", "cock"], async ctx => {
	const user = await ctx.database.dicks.getHistory(ctx.from);

	console.log(user);
});
