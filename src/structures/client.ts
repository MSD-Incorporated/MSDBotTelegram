import { autoQuote } from "@roziscoding/grammy-autoquote";
import { users } from "drizzle/user";
import { Bot, type Context } from "grammy";
import type { UserFromGetMe } from "grammy/types";
import {
	autoLinkerComposer,
	pingCommand,
	privacyCommand,
	sauceNaoComposer,
	startCommand,
	telegraphComposer,
} from "../handlers";
import { Database } from "./database";

const onStart = ({ id, username }: UserFromGetMe) => console.log(`${username} [${id}] started!`);

export class Client {
	readonly bot: Bot<Context>;
	readonly database: Database = new Database();

	constructor(TOKEN?: string) {
		this.bot = new Bot<Context>(TOKEN ?? process.env.TOKEN);
	}

	readonly init = async () => {
		process.once("SIGINT", () => this.bot.stop());
		process.once("SIGTERM", () => this.bot.stop());

		await this.database.connect();

		const allUsers = await this.database.db.select().from(users);
		console.log(allUsers);

		this.bot.use(autoQuote());
		this.bot.use(autoLinkerComposer);
		this.bot.use(sauceNaoComposer);
		this.bot.use(telegraphComposer);

		this.bot.command("ping", pingCommand);
		this.bot.command("start", startCommand);
		this.bot.command("privacy", privacyCommand);

		this.bot.catch(console.error);
		await this.bot.init();
		await this.bot.start({ drop_pending_updates: true, onStart });
	};
}
