import { Composer } from "grammy";
import sagiri from "sagiri";
import type { Message, MessageEntity } from "typegram";

const channelID = -1001528929804;
const chatChannelID = -1001528929804;

const urlParser = (urls: string[]) => {
	const sortedURLs: [string, string][] = [];

	urls.forEach(url => {
		if (url.includes("gelbooru")) sortedURLs.push(["Gelbooru", url]);
		if (url.includes("danbooru")) sortedURLs.push(["Danbooru", url]);
		if (url.includes("yande.re")) sortedURLs.push(["Yandere", url]);
		if (url.includes("x.com") || url.includes("twitter"))
			sortedURLs.push(["Twitter", url.replace("twitter.com", "fxtwitter.com").replace("x.com", "fxtwitter.com")]);
		if (url.includes("pixiv")) sortedURLs.push(["Pixiv", url]);
		if (url.includes("patreon")) sortedURLs.push(["Patreon", url]);
	});

	return sortedURLs;
};

export const msdIncorporatedComposer = new Composer();

msdIncorporatedComposer.on(["channel_post::hashtag", "edited_channel_post::hashtag"], async ctx => {
	const post = ctx.channelPost || ctx.editedChannelPost;
	if (channelID !== post.chat.id) return;

	const entities = (post.caption ? post.caption_entities : post.entities)!;
	if (entities.find(entity => entity.type === "text_link" && entity.url === "https://t.me/msd_inc")) return;

	const chatID = post.chat.id;
	const message_id = post.message_id;
	const original = post.caption ? post.caption : post.text;
	const str = original + "\n\n" + "MSD Incorporated" + "\n\n" + " | Donate";

	const linkEntity: MessageEntity = {
		length: "MSD Incorporated".length,
		offset: str.length - " | Donate".length - "MSD Incorporated".length,
		type: "text_link",
		url: "https://t.me/msd_inc",
	};

	const donateEntity: MessageEntity = {
		length: "Donate".length,
		offset: str.length - "Donate".length,
		type: "text_link",
		url: "https://t.me/msd_inc/14",
	};

	return post.caption
		? ctx.api.editMessageCaption(chatID, message_id, {
				caption: str,
				caption_entities: [...entities, linkEntity, donateEntity],
			})
		: ctx.api.editMessageText(chatID, message_id, str, {
				entities: [...entities, linkEntity, donateEntity],
			});
});

msdIncorporatedComposer.on(":photo").on(":is_automatic_forward", async ctx => {
	if (chatChannelID !== (ctx.message?.forward_origin! as Message).chat.id) return;
	if (!ctx.message?.caption?.includes("#Hentai")) return;
	if (ctx.message?.caption?.includes("#RealLife") || ctx.message?.caption?.includes("#Video")) return;
	if (ctx.message?.media_group_id) return;

	const file = await ctx.getFile();
	const url = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path!}`;

	const sauceNao = sagiri(process.env.SAUCENAO_TOKEN);
	const [res] = await sauceNao(url);

	if (!res?.raw.data.creator) return;

	const { author, characters } = res.raw.data;
	// @ts-ignore
	const material = res.raw.data.material;
	const urls = [...res.raw.data.ext_urls, res.raw.data.source].filter(val => val !== undefined);

	ctx.reply(
		[
			`• <b>Автор:</b> <code>${author || "Неизвестно"}</code>`,
			`• <b>Персонажи:</b> <code>${characters.split(", ").join("</code>, <code>") || "Неизвестно"}</code>`,
			`• <b>Откуда:</b> <code>${material || "Неизвестно"}</code>\n`,
			`• <b>Ссылки:</b> ${urlParser(urls)
				.map(([name, url]) => `<a href="${url}">${name}</a>`)
				.join(" | ")}`,
		].join("\n"),
		{
			parse_mode: "HTML",
		}
	);
});
