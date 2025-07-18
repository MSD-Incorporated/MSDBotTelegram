import { Composer } from "grammy";

import { version as msdbot_version } from "../../package.json" with { type: "json" };
import type { Context } from "../utils/context";

export const startComposer = new Composer<Context>();

const replyStartCommand = (
	ctx: Context,
	{ version, bun_version, msdbot_version }: { version: string; bun_version: string; msdbot_version: string }
) =>
	ctx.reply(ctx.t.start_command({ version, bun_version, msdbot_version }), {
		link_preview_options: { is_disabled: true },
		reply_markup: {
			inline_keyboard: [[{ text: ctx.t.start_channel_button(), url: "https://t.me/msdbot_information" }]],
		},
	});

startComposer.command("start", async ctx => {
	const version = process.version;
	const bun_version = Bun.version;

	console.log(await ctx.getChatMember(ctx.from!.id));

	if (ctx.match && ctx.from !== undefined) {
		const refferal_id = Number(ctx.match.slice("ref_".length));
		const refferal = await ctx.database.resolveUser({ id: refferal_id });
		const refferer = await ctx.database.resolveDick({ id: ctx.from.id });

		if (!refferal || refferer) return replyStartCommand(ctx, { version, bun_version, msdbot_version });

		await ctx.database.writeReferral({ id: refferal_id }, { id: ctx.from.id });
		await ctx.database.writeDick({ id: ctx.from.id });

		return ctx.reply(
			ctx.t.start_refferal_command({
				refferal_id: refferal_id,
				refferal_name: refferal.first_name + (refferal.last_name ? ` ${refferal.last_name}` : ""),
			})
		);
	}

	return replyStartCommand(ctx, { version, bun_version, msdbot_version });
});
