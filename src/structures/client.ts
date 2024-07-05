import { run } from "@grammyjs/runner";
import { Bot, type Context } from "grammy";

export class Client {
	readonly bot: Bot<Context>;

	constructor(TOKEN?: string) {
		this.bot = new Bot(TOKEN ?? process.env.TOKEN);
	}

	readonly init = async () => {
		await this.bot.init();

		this.bot.command("start", async ctx => ctx.react("👍"));

		run(this.bot, { runner: { fetch: { allowed_updates: ["message"] } } });
	};
}
