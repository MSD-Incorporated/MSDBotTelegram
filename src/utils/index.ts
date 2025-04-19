import type { Context } from "./context";

export const isSubscriber = async (ctx: Context, user_id: number, chat_id: number) =>
	await ctx.api
		.getChatMember(chat_id, user_id)
		.then(member => ["member", "creator", "administrator"].includes(member.status))
		.catch(() => false);

export const random = <MIN extends number, MAX extends number, IM extends boolean>(
	min: MIN,
	max: MAX,
	includeMax?: IM
) => Math.floor(Math.random() * (max - min + (includeMax ? 1 : 0)) + min);

export * from "./caching";
export * from "./context";
export * from "./formatter";
