import { Composer } from "grammy";

import { version as msdbot_version } from "../../package.json" with { type: "json" };
import type { Context } from "../utils";

const version = process.version;
const bun_version = Bun.version;

export const startComposer = new Composer<Context>();

startComposer.chatType(["group", "supergroup", "private"]).command("start", async ctx => {
	const text = ctx.t.start_command({ msdbot_version, version, bun_version });

	return ctx.reply(text);
});
