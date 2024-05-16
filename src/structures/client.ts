import { Bot, type Context } from "grammy";
import {
	evalCommand,
	gayCommand,
	geminiCommand,
	shellCommand,
	startCommand,
	telegraphCommand,
} from "../elements/commands";
import { autoLink, autoLinkEdited } from "../elements/handlers";

export class Client {
	public readonly bot: Bot<Context>;

	constructor(TOKEN?: string) {
		this.bot = new Bot(TOKEN ?? process.env.TOKEN);
	}

	public readonly init = async () => {
		process.once("SIGINT", () => this.bot.stop());
		process.once("SIGTERM", () => this.bot.stop());

		this.bot.command("start", startCommand);
		this.bot.command("telegraph", telegraphCommand);
		this.bot.command("eval", ctx => evalCommand(ctx, this));
		this.bot.command("gemini", geminiCommand);
		this.bot.command("shell", shellCommand);
		this.bot.command("gay", gayCommand);

		this.bot.on("channel_post", autoLink);
		this.bot.on("edited_channel_post", autoLinkEdited);

		this.bot.catch(err => {
			console.error(err);

			err.ctx.reply("Произошла неизвестная ошибка!", {
				reply_parameters: { message_id: err.ctx.message!.message_id ?? null },
			});
		});

		// TODO: Setup https://github.com/grammyjs/runner
		await this.bot.start({
			drop_pending_updates: true,
			onStart: ({ id, username }) => console.log(`${username} [${id}] started!`),
		});
	};
}
