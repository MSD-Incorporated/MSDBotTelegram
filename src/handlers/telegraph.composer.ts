import { Composer, InlineKeyboard } from "grammy";
import { MessageEntity } from "grammy/types";
import Telegraph from "telegra.ph";
import type { NodeElement, Page } from "telegra.ph/typings/telegraph";

const telegraph = new Telegraph(process.env.TELEGRAPH_TOKEN);
const version = process.env.npm_package_version;
const developerID = 946070039;
const channelID = -1001528929804;

const getContent = (page: Page) =>
	(page.content as NodeElement[]).filter(element => element.tag === "img" || element.tag === "figure");

const getPage = async (args: string[]) => {
	const id = args[0]!.replace("https://telegra.ph/", "");

	return telegraph.getPage(id, true);
};

export const telegraphComposer = new Composer();

telegraphComposer.callbackQuery("telegraph_post_manga", async ctx => {
	const manga = ctx.callbackQuery.message!.entities![0] as MessageEntity.TextLinkMessageEntity;
	const mangaName = ctx.callbackQuery.message!.text!;
	const url = manga.url;

	return ctx.api.sendMessage(
		channelID,
		[
			`#Hentai #Manga`,
			`<a href="${url}">${mangaName}</a>`,
			`<a href="https://t.me/msd_inc">🔗┆MSD Incorporated</a>`,
		].join("\n\n"),
		{
			parse_mode: "HTML",
		}
	);
});

telegraphComposer.command("telegraph", async ctx => {
	if (developerID !== ctx.from!.id) return;

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
