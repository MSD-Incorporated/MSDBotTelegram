import { im_here_banner } from "@msdbot/assets";
import { Composer, InputFile } from "grammy";

import { random, type Context } from "../utils";

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
