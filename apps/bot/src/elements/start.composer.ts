import { Composer, InputFile } from "grammy";

import { referral_banner } from "@msdbot/assets";
import { referrals } from "@msdbot/database";
import { $ } from "bun";
import { version as msdbot_version } from "../../package.json" with { type: "json" };
import { normalizeName, type Context } from "../utils";

const version = process.version;
const bun_version = Bun.version;
const git_commit = typeof GIT_COMMIT !== "undefined" ? GIT_COMMIT : await $`git rev-parse --short HEAD`.text();

const replyStartCommand = (ctx: Context) =>
	ctx.reply(ctx.t.start_command({ version, bun_version, msdbot_version, commit: git_commit }), {
		link_preview_options: { is_disabled: true },
	});

export const startComposer = new Composer<Context>();

startComposer.chatType(["group", "supergroup", "private"]).command("start", async ctx => {
	if (!ctx.match) return replyStartCommand(ctx);

	const refferer_id = Number(ctx.match.slice("ref_".length));
	const refferal = await ctx.database.query.referrals.findFirst({
		columns: { id: true },
		where: (refs, { eq }) => eq(refs.referral, ctx.from.id),
	});
	const referrer = await ctx.database.query.users.findFirst({
		columns: { user_id: true, first_name: true, last_name: true },
		where: (users, { eq }) => eq(users.user_id, refferer_id),
	});

	if (refferal || !referrer) return replyStartCommand(ctx);

	await ctx.database.insert(referrals).values({
		referral: ctx.from.id,
		referrer: refferer_id,
	});

	return ctx.replyWithPhoto(new InputFile(referral_banner), {
		caption: ctx.t.start_refferal_command({
			refferer_id: referrer.user_id,
			refferer_name: normalizeName(referrer),
		}),
	});
});
