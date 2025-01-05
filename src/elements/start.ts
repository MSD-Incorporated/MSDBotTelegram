import { Composer } from "grammy";
import { Context } from "../utils";

export const startComposer = new Composer<Context>();

startComposer.command("start", async ctx => {
	const version = process.version;
	const bun_version = Bun.version;

	const defaultStartCommand = () =>
		ctx.reply(ctx.t.start_command({ version, bun_version }), {
			link_preview_options: { is_disabled: true },
		});

	if (!ctx.match) return defaultStartCommand();
	if (ctx.from!.id === Number(ctx.match)) return defaultStartCommand();

	const refferal_id = Number(ctx.match);
	const refferal = await ctx.database.resolveUser({ id: refferal_id });
	if (!refferal) return defaultStartCommand();

	const refferer = await ctx.database.resolveDick({ id: ctx.from!.id });
	if (refferer) return defaultStartCommand();

	await ctx.database.writeReferral({ id: refferal_id }, { id: ctx.from!.id });
	await ctx.database.writeDick({ id: ctx.from!.id });

	return ctx.reply(
		ctx.t.start_refferal_command({
			refferal_id: refferal_id.toString(),
			refferal_name: refferal.first_name + (refferal.last_name ? ` ${refferal.last_name}` : ""),
		})
	);
});
