import { autoQuote } from "@roziscoding/grammy-autoquote";
import { Bot, InputFile, type Context } from "grammy";
import { resolve } from "path";
import { cwd } from "process";
import type { UserFromGetMe } from "typegram";
import {
	dickComposer,
	evalCommand,
	execCommand,
	githubLinkComposer,
	msdIncorporatedComposer,
	randomEmojiComposer,
	startCommand,
	telegraphComposer,
} from "../handlers";
import { Database } from "./database";

const onStart = ({ id, username }: UserFromGetMe) => console.log(`${username} [${id}] started!`);

export class Client {
	readonly bot: Bot<Context & { database: Database }>;
	readonly database: Database = new Database();

	constructor(TOKEN?: string) {
		this.bot = new Bot(TOKEN ?? process.env.TOKEN);
	}

	readonly init = async () => {
		process.once("SIGINT", () => this.bot.stop());
		process.once("SIGTERM", () => this.bot.stop());

		await this.database.connect();

		this.bot.use(autoQuote());
		this.bot.use(async (ctx, next) => {
			ctx.database = this.database;

			await next();
		});

		this.bot.use(async (ctx, next) => {
			const user = ctx.from;
			if (!user || user.is_bot || user.id == 777000) return await next();

			const dbuser = await this.database.resolveUser(user!, true);

			if (
				user?.first_name !== dbuser?.first_name ||
				user?.last_name !== dbuser?.last_name ||
				user?.username !== dbuser?.username
			) {
				await this.database.updateUser(user!, {
					first_name: user?.first_name,
					last_name: user?.last_name,
					username: user?.username,
				});
			}

			await next();
		});

		this.bot.use(dickComposer);
		this.bot.use(githubLinkComposer);
		this.bot.use(msdIncorporatedComposer);
		this.bot.use(randomEmojiComposer);
		this.bot.use(telegraphComposer);

		this.bot.command("eval", evalCommand);
		this.bot.command("exec", execCommand);
		this.bot.command("start", startCommand);

		this.bot.on("::mention", ctx => {
			if (ctx.message?.text == `@${this.bot.botInfo.username}`) return ctx.reply("Я тут!");
		});

		this.bot.on(":new_chat_members", async ctx => {
			if (ctx.chat.id !== -1001705068191) return;
			ctx.replyWithVideo(new InputFile(resolve(cwd(), "src", "media", "welcome.gif")));
		});

		this.bot.catch(console.error);
		await this.bot.init();
		await this.bot.start({ drop_pending_updates: true, onStart });
	};
}
