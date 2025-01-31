import { Composer } from "grammy";
import { resolve } from "path";
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
	const msdbot_version = (await import(resolve(process.cwd(), "package.json"))).version;
	const bun_version = Bun.version;

	if (ctx.match) {
		const refferal_id = Number(ctx.match.slice("ref_".length));
		const refferal = await ctx.database.resolveUser({ id: refferal_id });
		const refferer = await ctx.database.resolveDick({ id: ctx.from!.id });

		if (!refferal || refferer) return replyStartCommand(ctx, { version, bun_version, msdbot_version });

		await ctx.database.writeReferral({ id: refferal_id }, { id: ctx.from!.id });
		await ctx.database.writeDick({ id: ctx.from!.id });

		return ctx.reply(
			ctx.t.start_refferal_command({
				refferal_id: refferal_id,
				refferal_name: refferal.first_name + (refferal.last_name ? ` ${refferal.last_name}` : ""),
			})
		);
	}

	return replyStartCommand(ctx, { version, bun_version, msdbot_version });
});

startComposer.command("test", async ctx => {
	const user = await ctx.database.resolveChat(ctx.chat, true, { users: { with: { user: true } } });

	console.log(user);
});
