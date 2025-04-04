import { Composer, InputFile } from "grammy";
import { resolve } from "path";
import { cwd } from "process";
import sagiri from "sagiri";
import type { Message } from "typegram";
import type { Context } from "../utils";

const channelID = -1001528929804;
const chatChannelID = -1001705068191;

const urlParser = (urls: string[]) => {
	const sortedURLs: [string, string][] = [];

	urls.forEach(url => {
		if (url.includes("gelbooru")) sortedURLs.push(["Gelbooru", url]);
		if (url.includes("danbooru")) sortedURLs.push(["Danbooru", url]);
		if (url.includes("x.com") || url.includes("twitter"))
			sortedURLs.push(["Twitter", url.replace("twitter.com", "fxtwitter.com").replace("x.com", "fxtwitter.com")]);
		if (url.includes("pixiv")) sortedURLs.push(["Pixiv", url]);
		if (url.includes("yande.re")) sortedURLs.push(["Yandere", url]);
		if (url.includes("patreon")) sortedURLs.push(["Patreon", url]);
	});

	return sortedURLs;
};

export const msdIncorporatedComposer = new Composer<Context>();

msdIncorporatedComposer.on(":photo").on(":is_automatic_forward", async ctx => {
	if (channelID !== (ctx.message?.forward_origin! as Message).chat.id) return;
	if (!ctx.message?.caption?.includes("#Hentai")) return;
	if (ctx.message?.caption?.includes("#RealLife") || ctx.message?.caption?.includes("#Video")) return;
	if (ctx.message?.media_group_id) return;

	const file = await ctx.getFile();
	const url = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path!}`;

	const sauceNao = sagiri(process.env.SAUCENAO_TOKEN);
	const [res] = await sauceNao(url);

	if (!res?.raw.data.ext_urls.length) return;

	const { author, creator, characters } = res.raw.data;
	// @ts-ignore
	const material = res.raw.data.material;
	const urls = [...res.raw.data.ext_urls, res.raw.data.source].filter(val => val !== undefined);

	if (!url.length) return;

	return ctx.reply(
		[
			`• <b>Автор:</b> <code>${author || creator || "Неизвестно"}</code>`,
			`• <b>Персонажи:</b> <code>${(characters || "Неизвестно").split(", ").join("</code>, <code>") || "Неизвестно"}</code>`,
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

msdIncorporatedComposer.on(":caption", async ctx => {
	if (!ctx.message?.caption.includes("/search_full")) return;
	if (ctx.from!.id !== 946070039) return;

	const file = await ctx.getFile();
	const url = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path!}`;

	const sauceNao = sagiri(process.env.SAUCENAO_TOKEN);
	const [res] = await sauceNao(url);

	if (!res?.raw.data.ext_urls.length) return;

	const { author, creator, characters } = res.raw.data;
	// @ts-ignore
	const material = res.raw.data.material;
	const urls = [...res.raw.data.ext_urls, res.raw.data.source].filter(val => val !== undefined);

	if (!url.length) return ctx.reply("Не удалось найти!");

	return ctx.reply(
		[
			`• <b>Автор:</b> <code>${author || creator || "Неизвестно"}</code>`,
			`• <b>Персонажи:</b> <code>${(characters || "Неизвестно").split(", ").join("</code>, <code>") || "Неизвестно"}</code>`,
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

msdIncorporatedComposer.on(":new_chat_members", async ctx => {
	if (ctx.chat.id !== chatChannelID) return;
	ctx.replyWithAnimation(new InputFile(resolve(cwd(), "src", "media", "welcome.gif")));
});
