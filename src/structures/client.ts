import { autoQuote } from "@roziscoding/grammy-autoquote";
import { Bot, type Context } from "grammy";
import {
	autoCaching,
	dickComposer,
	execCommand,
	githubLinkComposer,
	msdIncorporatedComposer,
	randomShitComposer,
	startCommand,
	telegraphComposer,
} from "handlers";
import type { UserFromGetMe } from "typegram";
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
		this.bot.use(async (ctx, next) => autoCaching(ctx, this.database, next));
		this.bot.use(dickComposer);
		this.bot.use(githubLinkComposer);
		this.bot.use(msdIncorporatedComposer);
		this.bot.use(randomShitComposer);
		this.bot.use(telegraphComposer);

		this.bot.command("exec", execCommand);
		this.bot.command("start", startCommand);

		this.bot.catch(console.error);

		await this.bot.init();
		await this.bot.start({ drop_pending_updates: true, onStart });
	};
}
