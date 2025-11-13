import { version as msdbot_version } from "../package.json" with { type: "json" };
import { client } from "./structures/client";

const version = process.version;
const bun_version = Bun.version;

client.chatType(["group", "supergroup", "private"]).command("start", async ctx => {
	return ctx.reply(ctx.t.start_command({ msdbot_version, version, bun_version }), {});
});
