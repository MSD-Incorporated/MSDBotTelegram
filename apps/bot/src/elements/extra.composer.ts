import { im_here_banner } from "@msdbot/assets";
import { env } from "@msdbot/env";
import { bold, code, pre, premium_emoji } from "@msdbot/i18n";
import { $ } from "bun";
import { sql } from "drizzle-orm";
import { Composer, InputFile } from "grammy";
import { freemem, totalmem } from "os";

import { formatTime, keyboardBuilder, random, type Context } from "../utils";

export const extraComposer = new Composer<Context>();
const banner = new InputFile(im_here_banner);

extraComposer
	.chatType(["group", "supergroup", "private"])
	.filter(({ from }) => from !== undefined && !from.is_bot && Math.random() < 0.01)
	.on("message:text", async (ctx, next) => {
		await next();

		return ctx.react("👀").catch(() => {});
	});

extraComposer
	.chatType(["group", "supergroup", "private"])
	.filter(({ message, me }) => message !== undefined && message.text === `@${me.username}`)
	.on("::mention", async (ctx, next) => {
		await next();

		return ctx.replyWithPhoto(banner, { caption: ctx.t.im_here() });
	});

const badWords: string[] = [
	"иди нахуй",
	"пошёл нахуй",
	"выблядок",
	"сука",
	"блядь",
	"ебать",
	"заебал",
	"нахуй",
	"хуй",
	"пизда",
	"пиздец",
	"мудак",
	"мудачье",
	"гандон",
	"долбоёб",
	"долбоеб",
	"уебок",
	"уёбище",
	"хуёвый",
	"пиздуй",
	"пидр",
	"пидорка",
	"пидорас",
	"пидораска",
	"залупа",
	"ебанутый",
	"еблант",
	"еблан",
	"ебальник",
	"шлюха",
	"блядун",
	"пиздобол",
	"охуевший",
	"охуевшая",
	"хуесос",
	"хуесоска",
	"хуесосы",
	"ебланка",
	"пидорасик",
	"тварь",
	"уёбок",
	"ахуел",
];

const trashtalkResponses: string[] = [
	"пошёл нахуй долбаёб",
	"сам иди нахуй, мудак",
	"заебал уже своими сообщениями",
	"сука не позорься и ливни лол",
	"сам такой",
	"найс 0.5х0.5м комната блять ХАХАХАХА ТЫ ТАМ ЖЕ ДАЖЕ ПОВЕСИТЬСЯ НЕ МОЖЕШЬ МЕСТА НЕТ ПХПХПХППХ",
	"на мыло и веревку то деньги есть нищий хуесос????",
	"бля че тут эта нищая собака заскулила",
	"ебать ты красиво на бутылку упал пидорасина",
	"вырыгнись из окна нахуй вибратор юзер",
	"тебе права голоса не давали thirdworlder ебаный",
	"a вы (you) сэр собственно кто (who)?",
	"насрал тебе в ротешник проверяй",
	"парашыч ебаный",
	"ебать ты на хуек присел нихуева",
	"заглотнул коки яки",
	"уебашил дилдом по ебалу тебе, спи",
	"иди нахуй",
	"трахнут",
	"поспи хуйсоска",
];

extraComposer
	.chatType(["group", "supergroup", "private"])
	.filter(({ chat }) => chat.id === -1001705068191 || chat.id === 946070039)
	.filter(
		({ msg, me }) =>
			msg !== undefined &&
			msg.reply_to_message !== undefined &&
			msg.reply_to_message.from !== undefined &&
			msg.reply_to_message.from.id === me.id
	)
	.filter(
		({ msg }) =>
			msg !== undefined && msg.text !== undefined && badWords.some(word => msg.text!.toLowerCase().includes(word))
	)
	.on("message:text", async (ctx, next) => {
		await next();

		return ctx.reply(trashtalkResponses[random(0, trashtalkResponses.length - 1)]!).catch(() => {});
	});

const clean = async (text: string | Promise<string> | unknown) => {
	if (text && text.constructor && text.constructor.name == "Promise") text = await text;
	if (typeof text !== "string") text = require("util").inspect(text, { depth: 2 });

	text = (text as string)
		.replace(/`/g, "`" + String.fromCharCode(8203))
		.replace(/@/g, "@" + String.fromCharCode(8203));

	Object.values(env).forEach(val => {
		if (val) text = (text as string).replace(val.toString(), "***");
	});

	return text;
};

extraComposer
	.chatType(["private"])
	.filter(({ from }) => from.id === 946070039)
	.command("eval", async ctx => {
		const args = ctx.match.split(" ");
		let result: unknown;

		try {
			result = eval(args.join(" "));
		} catch (err) {
			result = (err as Error).message;
		}

		try {
			const cleaned = await clean(result);
			return ctx.reply(pre((cleaned as string).slice(0, 4096), "typescript"));
		} catch (err) {
			return ctx.reply(
				`Ошибка\n\n${pre(`[${(err as Error).name}] ` + (err as Error).message.slice(0, 3900), "sh")}`
			);
		}
	});

extraComposer
	.chatType(["private"])
	.filter(({ from }) => from.id === 946070039)
	.command(["sh", "shell"], async ctx =>
		$`${{ raw: ctx.match }}`
			.quiet()
			.then(async res => {
				const cleaned = await clean(res.text());
				return ctx
					.reply(pre(((cleaned || "Success") as string).slice(0, 4096), "sh"))
					.catch(err =>
						ctx.reply(
							`Ошибка\n\n${pre(`[${(err as Error).name}] ` + (err as Error).message.slice(0, 3900), "sh")}`
						)
					);
			})
			.catch(err =>
				ctx.reply(
					`Ошибка в коде\n\n${pre(`[${(err as Error).name}] ` + (err as Error).message.slice(0, 3900), "sh")}`
				)
			)
	);

extraComposer
	.chatType(["group", "supergroup", "private"])
	.filter(({ from }) => from?.id === 946070039)
	.command("stickers", async ctx => {
		const stickerSetName = ctx.match.split(" ")[0];
		if (!stickerSetName) return ctx.reply(`Введите название стикер пака!`);

		const { stickers } = await ctx.api.getStickerSet(stickerSetName.replace("https://t.me/addemoji/", ""));
		const stickersSet = stickers.map(
			sticker => `${premium_emoji(sticker.emoji!, sticker.custom_emoji_id!)} — ${code(sticker.custom_emoji_id!)}`
		);
		const stickersPages = Math.ceil(stickersSet.length / 100);

		return ctx.reply(stickers.length > 0 ? stickersSet.slice(0, 100).join("\n") : "Ничего не найдено!", {
			reply_markup: {
				inline_keyboard:
					stickersPages > 1
						? keyboardBuilder(
								ctx,
								"stickers",
								1,
								stickerSetName.replace("https://t.me/addemoji/", ""),
								stickersPages
							)
						: [],
			},
		});
	});

extraComposer
	.chatType(["group", "supergroup", "private"])
	.filter(({ from }) => from?.id === 946070039)
	.callbackQuery(/stickers_(.*)_(\d+)/, async ctx => {
		const stickerSetName = ctx.match[1];
		const page = Number(ctx.match[2]);
		const currentPage = Number(
			ctx.callbackQuery.message?.reply_markup?.inline_keyboard[0]
				?.find(({ text }) => text.includes("/"))
				?.text.split("/")[0]
		);

		if (page === currentPage) return ctx.answerCallbackQuery(ctx.t.keyboard_same_page());

		const { stickers } = await ctx.api.getStickerSet(stickerSetName!);
		const stickersSet = stickers.map(
			sticker => `${premium_emoji(sticker.emoji!, sticker.custom_emoji_id!)} — ${code(sticker.custom_emoji_id!)}`
		);

		const stickersPages = Math.ceil(stickersSet.length / 100);
		const keyboard = keyboardBuilder(ctx, "stickers", page, stickerSetName!, stickersPages);

		return ctx.editMessageText(
			stickers.length > 0 ? stickersSet.slice((page - 1) * 100, page * 100).join("\n") : "Ничего не найдено!",
			{ reply_markup: { inline_keyboard: keyboard } }
		);
	});

extraComposer
	.chatType(["group", "supergroup", "private"])
	.filter(({ from }) => from?.id === 946070039)
	.command("stats", async ctx => {
		const memoryUsage = process.memoryUsage();
		const rssInMB = Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100;

		const heapTotalInMB = Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100;
		const heapUsedInMB = Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100;

		const freeMemInMB = Math.round((freemem() / 1024 / 1024) * 100) / 100;
		const totalMemInMB = Math.round((totalmem() / 1024 / 1024) * 100) / 100;

		const cpuUsage = process.cpuUsage();
		const totalCPUTimeInSeconds = Math.round(((cpuUsage.user + cpuUsage.system) / 1e6) * 100) / 100;
		const CPUUsagePercentage = Math.round((totalCPUTimeInSeconds / (process.uptime() || 1)) * 100 * 100) / 100;

		const uptimeInHours = formatTime(process.uptime() * 1000);

		const pingShell =
			await $`ping ${process.platform === "win32" ? "-n" : "-c"} 3 ${env.LOCAL_API ? env.LOCAL_API.replace("http://", "") : "api.telegram.org"}`
				.quiet()
				.text();
		const match = pingShell.match(
			process.platform === "win32" ? /Average = (\d+)ms/ : /[\d.]+\/([\d.]+)\/[\d.]+\/[\d.]+/
		);
		const avgPing = parseFloat(match?.[1] ?? "1").toFixed(0);

		const beforeQuery = Date.now();
		await ctx.database.db.execute(sql`select 1`);
		const afterQuery = Date.now();
		const latency = afterQuery - beforeQuery;

		return ctx.reply(
			[
				premium_emoji("📊", "5877485980901971030") + bold(` Память:`),
				[
					"• " + bold(`RSS: `) + code(Math.floor(rssInMB)) + "мб",
					bold(`Heap Total: `) + code(Math.floor(heapTotalInMB)) + "мб",
					bold(`Heap Used: `) + code(Math.floor(heapUsedInMB)) + "мб",
					bold(`Free Memory: `) + code(Math.floor(freeMemInMB)) + "мб",
					bold(`Total Memory: `) + code(Math.floor(totalMemInMB)) + "мб",
				].join("\n• ") + "\n",
				premium_emoji("💻", "5967816500415827773") + bold(` CPU:`),
				[
					"• " + bold(`CPU Time: `) + code(totalCPUTimeInSeconds),
					bold(`CPU Usage: `) + code(CPUUsagePercentage) + "%",
				].join("\n• ") + "\n",
				"• " + bold(`API Latency: `) + code(`${avgPing}`) + "мс",
				"• " + bold(`DB Latency: `) + code(`${latency}`) + "мс",
				"• " + bold(`Uptime: `) + code(uptimeInHours),
			].join("\n")
		);
	});
