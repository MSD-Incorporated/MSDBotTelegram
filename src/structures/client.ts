import { autoQuote } from "@roziscoding/grammy-autoquote";
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

const onStart = ({ id, username }: UserFromGetMe) => console.log(`${username} [${id}] started!`);

export class Client {
	readonly bot: Bot<Context>;

	constructor(TOKEN?: string) {
		this.bot = new Bot<Context>(TOKEN ?? process.env.TOKEN);
	}

	readonly init = async () => {
		process.once("SIGINT", () => this.bot.stop());
		process.once("SIGTERM", () => this.bot.stop());

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
