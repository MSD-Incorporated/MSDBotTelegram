import { Composer, InputFile } from "grammy";
import { resolve } from "path";
import { cwd } from "process";
import sagiri from "sagiri";
import Telegraph from "telegra.ph";
import type { NodeElement, Page } from "telegra.ph/typings/telegraph";
import type { Message } from "typegram";
import type { Context } from "../utils";

const telegraph = new Telegraph(process.env.TELEGRAPH_TOKEN);
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

	if (urlParser(urls).length <= 0) return;

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

msdIncorporatedComposer.command("search_full", async ctx => {
	if (ctx.from!.id !== 946070039) return;
	if (!ctx.message?.reply_to_message || !ctx.message?.reply_to_message?.photo?.length) return;

	const file_id = ctx.message.reply_to_message.photo[0]!.file_id;
	const file = await ctx.api.getFile(file_id);
	const url = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path!}`;

	const sauceNao = sagiri(process.env.SAUCENAO_TOKEN);
	const [res] = await sauceNao(url);

	if (!res?.raw.data.ext_urls.length) return;

	const { author, creator, characters } = res.raw.data;
	// @ts-ignore
	const material = res.raw.data.material;
	const urls = [...res.raw.data.ext_urls, res.raw.data.source].filter(val => val !== undefined);

	if (urlParser(urls).length <= 0) return ctx.reply("Не удалось найти!");

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

	if (urlParser(urls).length <= 0) return ctx.reply("Не удалось найти!");

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

const getContent = (page: Page) =>
	(page.content as NodeElement[]).filter(element => element.tag === "img" || element.tag === "figure");

const getPage = async (args: string[]) => {
	const id = args[0]!.replace("https://telegra.ph/", "");

	return telegraph.getPage(id, true);
};

msdIncorporatedComposer.command("telegraph", async ctx => {
	if (ctx.from!.id !== 946070039) return;

	const args = ctx.msg.text.split(/\s+/).slice(1);
	if (!args?.length) return ctx.reply("Не удалось найти ID");

	const page = await getPage(args);
	const elements = getContent(page);
	const newPage = await telegraph.createPage(page.title, elements, "MSD Incorporated", "https://t.me/msd_inc");

	return ctx.reply(`<a href="${newPage.url}">${newPage.title}</a>`, {
		parse_mode: "HTML",
		reply_markup: {
			inline_keyboard: [[{ text: "Выложить в канал?", callback_data: "telegraph_post_manga" }]],
		},
	});
});

msdIncorporatedComposer.on(":new_chat_members", async ctx => {
	if (ctx.chat.id !== chatChannelID) return;
	ctx.replyWithAnimation(new InputFile(resolve(cwd(), "src", "media", "welcome.gif")));
});
