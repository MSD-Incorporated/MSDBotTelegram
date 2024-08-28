import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Composer, type Context } from "grammy";

export const dickComposer: Composer<Context & { database: NodePgDatabase }> = new Composer();

dickComposer.command("dick", async ctx => {
	const user = ctx.from;
});
