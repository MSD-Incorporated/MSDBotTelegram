import { Composer } from "grammy";
import { Message } from "grammy/types";
import sagiri from "sagiri";

const channelIDs: number[] = [-1001528929804];
const sauceNao = sagiri(process.env.SAUCENAO_TOKEN);

const urlParser = (urls: string[]) => {
	const sortedURLs: [string, string][] = [];

	urls.forEach(url => {
		if (url.includes("gelbooru")) sortedURLs.push(["Gelbooru", url]);
		if (url.includes("danbooru")) sortedURLs.push(["Danbooru", url]);
		if (url.includes("x.com") || url.includes("twitter"))
			sortedURLs.push(["Twitter", url.replace("twitter.com", "fxtwitter.com").replace("x.com", "fxtwitter.com")]);
		if (url.includes("pixiv") || url.includes("pximg")) sortedURLs.push(["Pixiv", url]);
		if (url.includes("patreon")) sortedURLs.push(["Patreon", url]);
	});

	return sortedURLs;
};

export const sauceNaoComposer = new Composer();

sauceNaoComposer.on(":photo").on(":is_automatic_forward", async ctx => {
	if (!channelIDs.includes((ctx.message?.forward_origin! as Message).chat.id)) return;
	if (!ctx.message?.caption?.includes("#Hentai")) return;
	if (ctx.message?.caption?.includes("#RealLife") || ctx.message?.caption?.includes("#Video")) return;
	if (ctx.message?.media_group_id) return;

	const file = await ctx.getFile();
	const url = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path!}`;
	const [res] = await sauceNao(url);

	if (!res?.raw.data.creator) return;

	const author = res.raw.data.creator;
	const characters = res.raw.data.characters;
	// @ts-ignore
	const material = res.raw.data.material;
	const urls = [...res.raw.data.ext_urls, res.raw.data.source].filter(val => val !== undefined);

	ctx.reply(
		[
			// TODO: href to author
			`Автор: <code>${author || "Неизвестно"}</code>`,
			`Персонажи: <code>${characters.split(", ").join("</code>, <code>") || "Неизвестно"}</code>`,
			`Материал: <code>${material || "Неизвестно"}</code>${material ? ` | <a href="https://gelbooru.com/index.php?page=post&s=list&tags=${material.replace(/\s+/gm, "_")}">Gelbooru</a> | <a href="https://danbooru.donmai.us/posts?tags=${material.replace(/\s+/gm, "_")}">Danbooru</a>` : ""}\n`,
			`Ссылки: ${urlParser(urls)
				.map(([name, url]) => `<a href="${url}">${name}</a>`)
				.join(" | ")}`,
		].join("\n"),
		{
			parse_mode: "HTML",
		}
	);
});
