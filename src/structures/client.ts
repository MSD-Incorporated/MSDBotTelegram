import { Bot, type Context } from "grammy";
import type { UserFromGetMe } from "grammy/types";

const onStart = ({ id, username }: UserFromGetMe) => console.log(`${username} [${id}] started!`);

export class Client {
	readonly bot: Bot<Context>;

	constructor(TOKEN?: string) {
		this.bot = new Bot<Context>(TOKEN ?? process.env.TOKEN);
	}

	readonly init = async () => {
		process.once("SIGINT", () => this.bot.stop());
		process.once("SIGTERM", () => this.bot.stop());

		this.bot.catch(console.error);
		await this.bot.init();
		await this.bot.start({ drop_pending_updates: true, onStart });
	};
}
