import { Bot, type Context } from "grammy";
import startCommand from "../elements/commands/start";

export class Client {
	public readonly bot: Bot<Context>;

	constructor(TOKEN?: string) {
		this.bot = new Bot(TOKEN ?? process.env.TOKEN);
	}

	public readonly init = async () => {
		process.once("SIGINT", () => this.bot.stop());
		process.once("SIGTERM", () => this.bot.stop());

		this.bot.command("start", startCommand);

		// TODO: Setup https://github.com/grammyjs/runner
		await this.bot.start({
			onStart: ({ id, username }) =>
				console.log(`${username} [${id}] started!`),
		});
	};
}
