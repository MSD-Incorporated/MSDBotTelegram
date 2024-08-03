import { Composer } from "grammy";
import type { MessageEntity } from "grammy/types";

const channelIDs: number[] = [-1001528929804];

export const autoLinkerComposer = new Composer();

autoLinkerComposer.on("channel_post::hashtag", async ctx => {
	const post = ctx.channelPost;
	if (!channelIDs.includes(post.chat.id)) return;

	const entities = (post.caption ? post.caption_entities : post.entities)!;
	if (entities.find(entity => entity.type === "text_link" && entity.url === "https://t.me/msd_inc")) return;

	const chatID = post.chat.id;
	const message_id = post.message_id;
	const original = post.caption ? post.caption : post.text;
	const str = original + "\n\n" + "🔗┆MSD Incorporated";
	const linkEntity: MessageEntity = {
		length: "🔗┆MSD Incorporated".length,
		offset: str.length - "🔗┆MSD Incorporated".length,
		type: "text_link",
		url: "https://t.me/msd_inc",
	};

	return post.caption
		? ctx.api.editMessageCaption(chatID, message_id, {
				caption: str,
				caption_entities: [...entities, linkEntity],
			})
		: ctx.api.editMessageText(chatID, message_id, str, {
				entities: [...entities, linkEntity],
			});
});

autoLinkerComposer.on("edited_channel_post::hashtag", async ctx => {
	const post = ctx.editedChannelPost;
	if (!channelIDs.includes(post.chat.id)) return;

	const entities = (post.caption ? post.caption_entities : post.entities)!;
	if (entities.find(entity => entity.type === "text_link" && entity.url === "https://t.me/msd_inc")) return;

	const chatID = post.chat.id;
	const message_id = post.message_id;
	const original = post.caption ? post.caption : post.text;
	const str = original + "\n\n" + "🔗┆MSD Incorporated";
	const linkEntity: MessageEntity = {
		length: "🔗┆MSD Incorporated".length,
		offset: str.length - "🔗┆MSD Incorporated".length,
		type: "text_link",
		url: "https://t.me/msd_inc",
	};

	return post.caption
		? ctx.api.editMessageCaption(chatID, message_id, {
				caption: str,
				caption_entities: [...entities, linkEntity],
			})
		: ctx.api.editMessageText(chatID, message_id, str, {
				entities: [...entities, linkEntity],
			});
});
