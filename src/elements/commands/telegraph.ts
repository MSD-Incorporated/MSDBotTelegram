import type { Context } from "grammy";
import Telegraph from "telegra.ph";
import type { NodeElement, Page } from "telegra.ph/typings/telegraph";
import { DEVELOPERS } from "../../config";

const getContent = (page: Page) =>
	(page.content as NodeElement[]).filter((element) => element.tag === "img" || element.tag === "figure");

export const telegraphCommand = async (ctx: Context) => {
	const telegraph = new Telegraph(process.env.TELEGRAPH);

	const getPage = async (args: string[]) => {
		const id = args[0]!.replace("https://telegra.ph/", "");

		return telegraph.getPage(id, true);
	};

	if (!(Array.isArray(DEVELOPERS) ? DEVELOPERS.includes(ctx.from?.id) : DEVELOPERS === ctx.from?.id)) return;

	const args = ctx.message?.text?.split(/\s+/).slice(1);
	if (!args?.length) return ctx.reply("Не удалось найти ID");

	const page = await getPage(args);
	const elements = getContent(page);
	const newPage = await telegraph.createPage(page.title, elements, "MSD Incorporated", "https://t.me/msd_inc");
	const channelBased = Boolean(JSON.parse(args[1]!));

	return ctx.reply(
		channelBased
			? `<a href="${newPage.url}">${newPage.title}</a>`
			: `<a href="${newPage.url}">Ссылка</a>\n\nНазвание: <code>${newPage.title}</code>`,
		{ parse_mode: "HTML" }
	);
};
