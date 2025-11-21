import { referral_banner } from "@msdbot/assets";
import { $ } from "bun";
import { Composer, InputFile } from "grammy";

import { version as msdbot_version } from "../../package.json" with { type: "json" };
import { normalizeName, type Context } from "../utils";

const version = process.version;
const bun_version = Bun.version;
const git_commit = typeof GIT_COMMIT !== "undefined" ? GIT_COMMIT : await $`git rev-parse --short HEAD`.text();

const ref_banner = new InputFile(referral_banner);

const replyStartCommand = (ctx: Context) =>
	ctx.reply(ctx.t.start_command({ version, bun_version, msdbot_version, commit: git_commit }), {
		link_preview_options: { is_disabled: true },
	});

export const startComposer = new Composer<Context>();

startComposer.chatType(["group", "supergroup", "private"]).command("start", async ctx => {
	if (!ctx.match) return replyStartCommand(ctx);

	const referrer_id = Number(ctx.match.slice("ref_".length));
	if (ctx.from.id === referrer_id) return replyStartCommand(ctx);

	const referral = await ctx.database.referrals.resolve(ctx.from);
	if (referral) return replyStartCommand(ctx);

	const referrer = await ctx.database.users.resolve(
		{ id: referrer_id },
		{ columns: { id: true, first_name: true, last_name: true } }
	);

	if (!referrer) return replyStartCommand(ctx);

	await ctx.database.referrals.create(ctx.from, referrer_id);

	return ctx.replyWithPhoto(ref_banner, {
		caption: ctx.t.start_referral_command({
			referrer_id: referrer.id,
			referrer_name: normalizeName(referrer),
		}),
	});
});
