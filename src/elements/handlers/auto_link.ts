import type { Context, NextFunction } from "grammy";

const channelIDs: number[] = [-1001528929804, -1002080023869, -1002046202850];

export const autoLink = async (ctx: Context, next: NextFunction) => {
	await next();

	const post = ctx.channelPost!;
	if (!channelIDs.includes(post.chat.id)) return;

	const entities = post.caption ? post.caption_entities : post.entities;

	if (!entities?.length) return;
	if (!entities.find(({ type }) => type === "hashtag")) return;
	if (entities.find((entity) => entity.type === "text_link" && entity.url === "https://t.me/msd_inc")) return;

	const chatID = post.chat.id;
	const message_id = post.message_id;
	const original = post.caption ? post.caption : post.text;
	const str = original + "\n\n" + "🔗┆MSD Incorporated";

	await (post.caption
		? ctx.api.editMessageCaption(chatID, message_id, {
				caption: str,
				caption_entities: [
					...entities,
					{
						length: "🔗┆MSD Incorporated".length,
						offset: str.length - "🔗┆MSD Incorporated".length,
						type: "text_link",
						url: "https://t.me/msd_inc",
					},
				],
			})
		: ctx.api.editMessageText(chatID, message_id, str, {
				entities: [
					...entities,
					{
						length: "🔗┆MSD Incorporated".length,
						offset: str.length - "🔗┆MSD Incorporated".length,
						type: "text_link",
						url: "https://t.me/msd_inc",
					},
				],
			}));
};

export const autoLinkEdited = async (ctx: Context, next: NextFunction) => {
	await next();

	const post = ctx.editedChannelPost!;
	if (!channelIDs.includes(post.chat.id)) return;

	const entities = post.caption ? post.caption_entities : post.entities;

	if (!entities?.length) return;
	if (!entities.find(({ type }) => type === "hashtag")) return;
	if (entities.find((entity) => entity.type === "text_link" && entity.url === "https://t.me/msd_inc")) return;

	const chatID = post.chat.id;
	const message_id = post.message_id;
	const original = post.caption ? post.caption : post.text;
	const str = original + "\n\n" + "🔗┆MSD Incorporated";

	await (post.caption
		? ctx.api.editMessageCaption(chatID, message_id, {
				caption: str,
				caption_entities: [
					...entities,
					{
						length: "🔗┆MSD Incorporated".length,
						offset: str.length - "🔗┆MSD Incorporated".length,
						type: "text_link",
						url: "https://t.me/msd_inc",
					},
				],
			})
		: ctx.api.editMessageText(chatID, message_id, str, {
				entities: [
					...entities,
					{
						length: "🔗┆MSD Incorporated".length,
						offset: str.length - "🔗┆MSD Incorporated".length,
						type: "text_link",
						url: "https://t.me/msd_inc",
					},
				],
			}));
};
