import { env } from "@msdbot/env";
import { bold, boldAndTextLink, premium_emoji } from "@msdbot/i18n";
import { Composer, InputFile } from "grammy";
import sagiri from "sagiri";

import type { Context } from "../utils";

const channelID = -1001528929804 as const;
const chatID = -1001765200223 as const;

const urlParser = (urls: string[]) => {
	const mapping: Record<string, string> = {
		gelbooru: "Gelbooru",
		danbooru: "Danbooru",
		"yande.re": "Yandere",
	};

	return urls.reduce(
		(acc, url) => {
			for (const [key, name] of Object.entries(mapping)) {
				if (url.includes(key)) acc.push([name, url]);
			}
			if (url.includes("x.com") || url.includes("twitter"))
				acc.push(["Twitter", url.replace(/(twitter\.com|x\.com)/, "fxtwitter.com")]);

			return acc;
		},
		[] as [string, string][]
	);
};

const tagCategories: [string, string[]][] = [
	["#Pussy", ["pussy"]],
	["#Boobs", ["breasts", "boobs"]],
	["#Ass", ["ass"]],
	["#Panties", ["panties"]],
	["#Thighs", ["thighhighs", "thighs"]],
	["#Anal", ["anal"]],
	["#Skirt", ["skirt"]],
	["#Censored", ["censored"]],
	["#Yuri", ["yuri", "lesbian"]],
	["#BDSM", ["bondage", "bdsm"]],
];

const tagsFromList = (tagList: string[]): string[] => {
	const filtered = tagCategories
		.filter(([, tags]) => tags.some(tag => tagList.includes(tag)))
		.map(([label]) => label);
	return [...new Set(filtered)];
};

const getGelbooruTags = async (postId: string): Promise<string[]> => {
	try {
		const url = `https://gelbooru.com/index.php?page=dapi&q=index&json=1&s=post&id=${postId}&api_key=${env.GELBOORU_API_KEY}&user_id=${env.GELBOORU_USER_ID}`;
		const res = await fetch(url);
		const data = (await res.json()) as { post: Array<{ tags: string }> };
		const tagList = data.post[0]?.tags.split(" ") || [];
		return tagsFromList(tagList);
	} catch {
		return [];
	}
};

const getDanbooruTags = async (postId: string): Promise<string[]> => {
	try {
		const url = `https://danbooru.donmai.us/posts/${postId}.json?login=${env.DANBOORU_LOGIN}&api_key=${env.DANBOORU_API_KEY}`;
		const res = await fetch(url, { headers: { "User-Agent": "curl/8.7.1" } });
		const data = (await res.json()) as { tag_string?: string };
		const tagList = data.tag_string?.split(" ") || [];
		return tagsFromList(tagList);
	} catch {
		return [];
	}
};

const search_full = async (ctx: Context, file_id?: string) => {
	const file = file_id ? await ctx.api.getFile(file_id) : await ctx.getFile();
	const fileUrl = `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${file.file_path!}`;

	const bun_file = env.NODE_ENV === "dev" || !env.LOCAL_API ? await fetch(fileUrl) : Bun.file(file.file_path!);

	const image = Buffer.from(await bun_file.arrayBuffer());
	if (env.LOCAL_API) (bun_file as unknown as Bun.BunFile).delete();

	const sauceNao = sagiri(env.SAUCENAO_TOKEN);
	const [res] = await sauceNao(image);

	if (!res?.raw?.data?.ext_urls?.length) return { text: ["Не удалось найти!"] };

	// @ts-ignore
	const { author, creator, characters, material, gelbooru_id, danbooru_id } = res.raw.data!;
	const urls = [...(res.raw.data.ext_urls || []), res.raw.data.source].filter(Boolean) as string[];
	const parsedUrls = urlParser(urls);

	if (parsedUrls.length === 0) return { text: ["Не удалось найти!"] };

	const danbooruId = danbooru_id ?? urls.find(u => u.includes("danbooru.donmai.us"))?.match(/\/posts\/(\d+)/)?.[1];

	let tags = gelbooru_id ? await getGelbooruTags(gelbooru_id) : [];
	if (tags.length === 0 && danbooruId) tags = await getDanbooruTags(danbooruId);

	return {
		text: [
			`• <b>Автор:</b> <code>${author || creator || "Неизвестно"}</code>`,
			`• <b>Персонажи:</b> <code>${(characters || "Неизвестно").split(", ").join("</code>, <code>")}</code>`,
			`• <b>Откуда:</b> <code>${material || "Неизвестно"}</code>\n`,
			`• <b>Ссылки:</b> ${parsedUrls.map(([n, u]) => `<b><a href="${u}">${n}</a></b>`).join(" | ")}`,
		],
		author: author ?? creator ?? null,
		characters: characters ?? null,
		material: material ?? null,
		tags: tags.length > 0 ? tags.join(" ") : null,
		file: image,
	};
};

const toTag = (name: string): string => {
	const formatted = name.charAt(0).toUpperCase() + name.slice(1);
	return "#" + formatted.replace(/([ _-][a-z])/g, ltr => ltr.toUpperCase()).replace(/[^a-zA-Z0-9#]/g, "");
};

const formatTags = (input: string | null | undefined, removePatreon = false): string[] => {
	if (!input) return [];

	let names = input.split(", ").map(name => name.replace(/ \(.*\)$/, "").toLowerCase());
	if (removePatreon) names = names.filter(name => name !== "patreon");

	return names.filter(Boolean).map(toTag);
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

		const data = (await search_full(ctx)) as {
			text: string[];
			author: string;
			characters: string;
			material: string;
			tags: string;
			file: Buffer<ArrayBuffer>;
		};
		if (!data.text || data.text[0] == "Не удалось найти!") return;

		await ctx.reply(data.text.join("\n"), {
			parse_mode: "HTML",
			message_thread_id: 46052,
			disable_notification: true,
			reply_parameters: undefined,
		});

		const authorTag = data.author ? toTag(data.author.replace(/ \(.*\)$/, "").toLowerCase()) : "#Unknown";
		const sourceTags = [...new Set([...formatTags(data.material, true), ...formatTags(data.characters)])].filter(
			tag => tag !== "#Original"
		);
		const source = sourceTags.join(" ");

		const text = [
			premium_emoji("👤", "5879770735999717115") + " " + bold(`Author: `) + authorTag,
			premium_emoji("🏷", "5854776233950188167") + " " + bold(`Tags: `) + data.tags,
		];

		if (source)
			text.push(premium_emoji("🌐", "5879585266426973039") + " " + bold(`Source: `) + source);

		text.push(
			"\n" +
				[
					boldAndTextLink("MSD Incorporated", "https://t.me/msd_inc"),
					boldAndTextLink("Donate", "https://t.me/msd_inc/14"),
					bold("#Hentai"),
				].join(" • ")
		);

		return ctx.replyWithPhoto(new InputFile(Buffer.from(data.file)), {
			caption: text.join("\n"),
			message_thread_id: 46048,
			disable_notification: true,
			reply_parameters: undefined,
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

		return ctx.reply(data.text.join("\n"), { parse_mode: "HTML" });
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

		return ctx.reply(data.text.join("\n"), { parse_mode: "HTML" });
	});
