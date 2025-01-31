import type { NextFunction } from "grammy";
import type { Database } from "../structures";
import type { Context } from "./context";

export const autoUserCaching = async (
	ctx: Context & { database: Database },
	database: Database,
	next: NextFunction
) => {
	ctx.database = database;

	const user = ctx.from;
	if (!user || user.is_bot || user.id == 777000) return next();

	const dbuser = (await database.resolveUser(user!, true))!;

	if (
		user.first_name !== dbuser.first_name ||
		user?.last_name !== dbuser?.last_name ||
		user?.username !== dbuser?.username ||
		user.is_premium !== dbuser.is_premium
	) {
		await database.updateUser(user!, {
			first_name: user?.first_name,
			last_name: user?.last_name ?? null,
			username: user?.username ?? null,
			is_premium: user?.is_premium,
		});
	}

	return next();
};

export const autoChatCaching = async (
	ctx: Context & { database: Database },
	database: Database,
	next: NextFunction
) => {
	ctx.database = database;

	const chat = ctx.chat;
	if (!chat || chat.type == "private") return next();

	const dbchat = await database.resolveChat(chat, true);

	if (chat?.title !== dbchat?.title || chat?.is_forum !== dbchat?.is_forum || chat?.username !== dbchat?.username) {
		await database.updateChat(chat!, {
			title: chat?.title,
			username: chat?.username ?? null,
			is_forum: chat?.is_forum ?? null,
		});
	}

	return next();
};

export const autoChatMemberCaching = async (
	ctx: Context & { database: Database },
	database: Database,
	next: NextFunction
) => {
	ctx.database = database;

	const chat = ctx.chat;
	const user = ctx.from;
	if (!chat || !user || chat.type == "private" || user.id == 777000 || user.is_bot) return next();

	const member = await ctx.getChatMember(user.id).catch(() => {});
	if (!member) return next();

	const chatMember = await database.resolveChatMember(chat, member, true);

	if (chatMember?.status != member?.status && member?.status !== "left" && member?.status !== "kicked") {
		await database.updateChatMember(chat, member, { status: member.status });
	}

	return next();
};

export const autoChatMemberDeletion = async (
	ctx: Context & { database: Database },
	database: Database,
	next: NextFunction
) => {
	ctx.database = database;

	if (!ctx.chat || !ctx.chatMember || ctx.chatMember?.from.is_bot) return next();

	const { new_chat_member } = ctx.chatMember;
	if (new_chat_member.status === "kicked" || new_chat_member.status === "left")
		await database.updateChatMember(ctx.chat, { user: new_chat_member.user }, { status: new_chat_member.status });

	return next();
};
