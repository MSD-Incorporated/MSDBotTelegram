import { autoQuote } from "@roziscoding/grammy-autoquote";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Bot, type Context } from "grammy";
import type { UserFromGetMe } from "grammy/types";
import {
	autoLinkerComposer,
	dickComposer,
	pingCommand,
	privacyCommand,
	sauceNaoComposer,
	startCommand,
	telegraphComposer,
} from "../handlers";
import { Database, type Schema } from "./database";

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
			if (!user) await next();

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

		this.bot.use(autoLinkerComposer);
		this.bot.use(sauceNaoComposer);
		this.bot.use(telegraphComposer);
		this.bot.use(dickComposer);

		this.bot.command("ping", pingCommand);
		this.bot.command("start", startCommand);
		this.bot.command("privacy", privacyCommand);

		this.bot.catch(console.error);
		await this.bot.init();
		await this.bot.start({ drop_pending_updates: true, onStart });
	};
}
