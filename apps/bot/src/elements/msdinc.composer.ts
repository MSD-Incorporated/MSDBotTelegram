import { env } from "@msdbot/env";
import { Composer, InputFile } from "grammy";
import sagiri from "sagiri";

import type { Context } from "../utils";

const channelID = -1001528929804 as const;
const chatID = -1001765200223 as const;

const urlParser = (urls: string[]) => {
	const sortedURLs: [string, string][] = [];

	urls.forEach(url => {
		if (url.includes("gelbooru")) sortedURLs.push(["Gelbooru", url]);
		if (url.includes("danbooru")) sortedURLs.push(["Danbooru", url]);
		if (url.includes("x.com") || url.includes("twitter"))
			sortedURLs.push(["Twitter", url.replace("twitter.com", "fxtwitter.com").replace("x.com", "fxtwitter.com")]);
		if (url.includes("yande.re")) sortedURLs.push(["Yandere", url]);
	});

	return sortedURLs;
};

const search_full = async (ctx: Context, file_id?: string) => {
	const file = file_id === undefined ? await ctx.getFile() : await ctx.api.getFile(file_id);

	const bun_file =
		env.NODE_ENV === "dev" || env.LOCAL_API === undefined
			? await fetch(`https://api.telegram.org/file/bot${env.BOT_TOKEN}/${file.file_path!}`)
			: Bun.file(file.file_path!);
	const image = Buffer.from(await bun_file.arrayBuffer());

	if (env.LOCAL_API) (bun_file as unknown as Bun.BunFile).delete();

	const sauceNao = sagiri(env.SAUCENAO_TOKEN);
	const [res] = await sauceNao(image);

	if (!res || !res.raw.data?.ext_urls?.length) return { text: ["Не удалось найти!"] };

	const { author, creator, characters } = res.raw.data;
	// @ts-ignore
	const material = res.raw.data.material;
	const urls = [...res.raw.data.ext_urls, res.raw.data.source].filter(val => val !== undefined);

	if (urlParser(urls).length == 0) return { text: ["Не удалось найти!"] };

	return {
		text: [
			`• <b>Автор:</b> <code>${author || creator || "Неизвестно"}</code>`,
			`• <b>Персонажи:</b> <code>${(characters || "Неизвестно").split(", ").join("</code>, <code>") || "Неизвестно"}</code>`,
			`• <b>Откуда:</b> <code>${material || "Неизвестно"}</code>\n`,
			`• <b>Ссылки:</b> ${urlParser(urls)
				.map(([name, url]) => `<b><a href="${url}">${name}</a></b>`)
				.join(" | ")}`,
		],

		file: image,
	};
};

export const MSDIncComposer = new Composer<Context>();

MSDIncComposer.chatType("supergroup")
	.filter(
		({ message }) =>
			message?.chat.type === "supergroup" && message.chat.id === chatID && message.message_thread_id === 43535
	)
	.filter(({ message }) => message?.media_group_id === undefined)
	.on(":photo", async (ctx, next) => {
		await next();

		const data = (await search_full(ctx)) as { text: string[]; file: Buffer<ArrayBuffer> };
		if (!data.text || data.text[0] == "Не удалось найти!") return;

		return ctx.replyWithPhoto(new InputFile(data.file), {
			caption: data.text.join("\n"),
			parse_mode: "HTML",
		});
	});

MSDIncComposer.chatType(["group", "supergroup", "private"])
	.filter(({ from }) => from!.id === 946070039)
	.command(["sauce", "search_full"], async (ctx, next) => {
		await next();

		if (!ctx.message?.reply_to_message || !ctx.message?.reply_to_message?.photo?.length) return;

		const photos = ctx.message.reply_to_message.photo;
		const file_id = photos[photos.length - 1]!.file_id;

		const data = (await search_full(ctx, file_id)) as { text: string[]; file: Buffer<ArrayBuffer> };
		if (!data.text || data.text[0] === "Не удалось найти!") return ctx.reply("Не удалось найти!");

		return ctx.replyWithPhoto(new InputFile(Buffer.from(data.file)), {
			caption: data.text.join("\n"),
			parse_mode: "HTML",
		});
	});

MSDIncComposer.chatType(["group", "supergroup"])
	.filter(
		({ message }) => message?.forward_origin?.type === "channel" && message.forward_origin.chat.id === channelID
	)
	.filter(({ message }) => message?.caption !== undefined && message.caption.includes("#Hentai"))
	.filter(({ message }) => message?.media_group_id === undefined)
	.on(":photo")
	.on(":is_automatic_forward", async (ctx, next) => {
		await next();

		const data = (await search_full(ctx)) as { text: string[]; file: Buffer<ArrayBuffer> };
		if (!data.text || data.text[0] == "Не удалось найти!") return;

		return ctx.replyWithPhoto(new InputFile(data.file), {
			caption: data.text.join("\n"),
			parse_mode: "HTML",
		});
	});
