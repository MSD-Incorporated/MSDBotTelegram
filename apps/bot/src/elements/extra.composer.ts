import { im_here_banner } from "@msdbot/assets";
import { Composer, InputFile } from "grammy";
import { freemem, totalmem } from "os";

import { env } from "@msdbot/env";
import { bold, code, pre, premium_emoji } from "@msdbot/i18n";
import { $ } from "bun";
import { formatTime, random, type Context } from "../utils";

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
		try {
			const evaled = eval(args.join(" "));

			await clean(evaled)
				.then(async cleaned => {
					return ctx
						.reply(pre((cleaned as string).slice(0, 4096), "typescript"))
						.catch(err =>
							ctx.reply(
								`Ошибка\n\n${pre(`[${(err as Error).name}] ` + (err as Error).message.slice(0, 3900), "sh")}`
							)
						);
				})
				.catch(async err =>
					ctx.reply(
						`Ошибка\n\n${pre(`[${(err as Error).name}] ` + (err as Error).message.slice(0, 3900), "sh")}`
					)
				);
		} catch (err) {
			await clean((err as Error).message)
				.then(async cleaned => {
					return ctx
						.reply(pre((cleaned as string).slice(0, 4096), "typescript"))
						.catch(err =>
							ctx.reply(
								`Ошибка\n\n${pre(`[${(err as Error).name}] ` + (err as Error).message.slice(0, 3900), "sh")}`
							)
						);
				})
				.catch(async err =>
					ctx.reply(
						`Ошибка\n\n${pre(`[${(err as Error).name}] ` + (err as Error).message.slice(0, 3900), "sh")}`
					)
				);
		}
	});

extraComposer
	.chatType(["private"])
	.filter(({ from }) => from.id === 946070039)
	.command(["sh", "shell"], async ctx => {
		const args = ctx.match.split(" ");
		await $`${args}`
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
			);
	});

extraComposer
	.chatType(["private"])
	.filter(({ from }) => from.id === 946070039)
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

		return ctx.reply(
			[
				premium_emoji("📊", "5877485980901971030") + bold(` Память:`),
				[
					"• " + bold(`RSS: `) + code(Math.floor(rssInMB)) + " мб",
					bold(`Heap Total: `) + code(heapTotalInMB) + " мб",
					bold(`Heap Used: `) + code(heapUsedInMB) + " мб",
					bold(`Free Memory: `) + code(Math.floor(freeMemInMB)) + " мб",
					bold(`Total Memory: `) + code(Math.floor(totalMemInMB)) + " мб",
				].join("\n• "),
				premium_emoji("💻", "5967816500415827773") + bold(` CPU:`),
				[
					"• " + bold(`CPU Time: `) + code(totalCPUTimeInSeconds),
					bold(`CPU Usage: `) + code(CPUUsagePercentage) + "%",
				].join("\n• "),
				bold(`Время работы: `) + code(uptimeInHours),
			].join("\n\n")
		);
	});
