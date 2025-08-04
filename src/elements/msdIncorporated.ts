import { Composer } from "grammy";
import sagiri from "sagiri";
import Telegraph from "telegra.ph";
import type { NodeElement, Page } from "telegra.ph/typings/telegraph";
import type { Message } from "typegram";

import type { Context } from "../utils";

const telegraph = new Telegraph(process.env.TELEGRAPH_TOKEN);
const channelID = -1001528929804;

const getContent = (page: Page) =>
	(page.content as NodeElement[]).filter(element => element.tag === "img" || element.tag === "figure");

const getPage = async (args: string[] | string) => {
	const id = (Array.isArray(args) ? args[0] : args)!.replace("https://telegra.ph/", "");

	return telegraph.getPage(id, true);
};

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

const search_full = async (ctx: Context, file_id?: string) => {
	const file = file_id === undefined ? await ctx.getFile() : await ctx.api.getFile(file_id);
	const bun_file =
		process.env.LOCAL_API === undefined
			? await fetch(`https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path!}`)
			: Bun.file(file.file_path!);
	const image = Buffer.from(await bun_file.arrayBuffer());

	const sauceNao = sagiri(process.env.SAUCENAO_TOKEN);
	const [res] = await sauceNao(image);

	if (!res || !res.raw.data?.ext_urls?.length) return { text: ["Не удалось найти!"] };

	const { author, creator, characters } = res.raw.data;
	// @ts-ignore
	const material = res.raw.data.material;
	const urls = [...res.raw.data.ext_urls, res.raw.data.source].filter(val => val !== undefined);

	if (urlParser(urls).length == 0) {
		if (process.env.LOCAL_API) (bun_file as unknown as Bun.BunFile).delete();

		return { text: ["Не удалось найти!"] };
	}

	return {
		text: [
			`• <b>Автор:</b> <code>${author || creator || "Неизвестно"}</code>`,
			`• <b>Персонажи:</b> <code>${(characters || "Неизвестно").split(", ").join("</code>, <code>") || "Неизвестно"}</code>`,
			`• <b>Откуда:</b> <code>${material || "Неизвестно"}</code>\n`,
			`• <b>Ссылки:</b> ${urlParser(urls)
				.map(([name, url]) => `<b><a href="${url}">${name}</a></b>`)
				.join(" | ")}`,
		],

		file: bun_file,
	};
};

export const msdIncorporatedComposer = new Composer<Context>();

msdIncorporatedComposer.on(":photo").on(":is_automatic_forward", async ctx => {
	if (channelID !== (ctx.message?.forward_origin! as Message).chat?.id) return;
	if (!ctx.message?.caption?.includes("#Hentai")) return;
	if (ctx.message?.caption?.includes("#RealLife") || ctx.message?.caption?.includes("#Video")) return;
	if (ctx.message?.media_group_id) return;

	const data = (await search_full(ctx)) as { text: string[]; file: Bun.BunFile };
	if (!data.text) return;
	if (data.text[0] == "Не удалось найти!") return;

	return ctx.reply(data.text.join("\n")).then(async () => {
		if (process.env.LOCAL_API && data.file) await (data.file as unknown as Bun.BunFile).delete();
	});
});

msdIncorporatedComposer.command("search_full", async ctx => {
	if (ctx.from!.id !== 946070039) return;
	if (!ctx.message?.reply_to_message || !ctx.message?.reply_to_message?.photo?.length) return;

	const photos = ctx.message.reply_to_message.photo;
	const file_id = photos[photos.length - 1]!.file_id;

	const data = (await search_full(ctx, file_id)) as { text: string[]; file: Bun.BunFile };
	if (!data.text) return;

	return ctx.reply(data.text.join("\n")).then(async () => {
		if (process.env.LOCAL_API && data.file) await (data.file as unknown as Bun.BunFile).delete();
	});
});

msdIncorporatedComposer.on(":caption", async ctx => {
	if (!ctx.message?.caption.includes("/search_full")) return;
	if (ctx.from!.id !== 946070039) return;

	const data = (await search_full(ctx)) as { text: string[]; file: Bun.BunFile };

	console.log(data);

	if (!data.text) return;

	return ctx.reply(data.text.join("\n")).then(async () => {
		if (process.env.LOCAL_API && data.file) await (data.file as unknown as Bun.BunFile).delete();
	});
});

msdIncorporatedComposer.command("telegraph", async ctx => {
	if (ctx.from!.id !== 946070039) return;

	const args = ctx.msg.text.split(/\s+/).slice(1);
	if (!args?.length) return ctx.reply("Не удалось найти ID");

	const page = await getPage(args);
	const elements = getContent(page);
	const newPage = await telegraph.createPage(page.title, elements, "MSD Incorporated", "https://t.me/msd_inc");

	return ctx.reply(`<a href="${newPage.url}">${newPage.title}</a>`, {
		parse_mode: "HTML",
	});
});
