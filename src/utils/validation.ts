import type { Context } from "./context";

export const isSubscriber = async (ctx: Context, user_id: number, chat_id: number) =>
	await ctx.api
		.getChatMember(chat_id, user_id)
		.then(member => ["member", "creator", "administrator"].includes(member.status))
		.catch(() => false);
