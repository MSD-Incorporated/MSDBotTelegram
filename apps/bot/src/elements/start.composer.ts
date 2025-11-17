import { Composer } from "grammy";

import { $ } from "bun";
import { version as msdbot_version } from "../../package.json" with { type: "json" };
import type { Context } from "../utils";

const version = process.version;
const bun_version = Bun.version;
const git_commit = typeof GIT_COMMIT !== "undefined" ? GIT_COMMIT : await $`git rev-parse --short HEAD`.text();

export const startComposer = new Composer<Context>();

startComposer.chatType(["group", "supergroup", "private"]).command("start", async ctx => {
	const text = ctx.t.start_command({ msdbot_version, version, bun_version, commit: git_commit });

	return ctx.reply(text);
});
