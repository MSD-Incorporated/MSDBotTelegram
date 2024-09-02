import { desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Composer, type Context } from "grammy";
import moment from "moment";
import { dick_history, dicks } from "../drizzle/dick";
import { users } from "../drizzle/user";

const timeout = 12 * 60 * 60;

export const dickComposer: Composer<Context & { database: NodePgDatabase }> = new Composer();

dickComposer.command("dick", async ctx => {
	const user = ctx.from!;

	// TODO: Fix that shitcode
	let db_user = (await ctx.database.select().from(users).where(eq(users.user_id, user.id)))[0]!;
	if (!db_user) {
		await ctx.database
			.insert(users)
			.values({ user_id: user.id, first_name: user.first_name, last_name: user.last_name });

		db_user = (await ctx.database.select().from(users).where(eq(users.user_id, user.id)))[0]!;
	}

	let db_user_dick = (await ctx.database.select().from(dicks).where(eq(dicks.user_id, user.id)))[0]!;
	if (!db_user_dick) {
		await ctx.database.insert(dicks).values({ user_id: user.id });

		db_user_dick = (await ctx.database.select().from(dicks).where(eq(dicks.user_id, user.id)))[0]!;
	}

	const size = db_user_dick.size;

	const now = moment().unix();
	const lastUsed = now - db_user_dick.timestamp.getTime();

	if (lastUsed < timeout) {
		const timeLeft = moment((timeout - lastUsed) * 1000)
			.utc(false)
			.format("HH:mm:ss");
		return ctx.reply(
			`Попробуйте через <code>${timeLeft}</code> \n\nВаш текущий размер pp: <code>${size}</code> см \n\nТаблицы лидеров и истории на данный момент нет - ожидайте в будущем`,
			{ parse_mode: "HTML" }
		);
	}

	const difference = Math.floor(Math.random() * (7 - -7 + 1)) + -7;

	await ctx.database
		.update(dicks)
		.set({ size: size + difference, timestamp: new Date(now) })
		.where(eq(dicks.user_id, user.id));

	await ctx.database.insert(dick_history).values({ user_id: user.id, size, difference });

	const phrase =
		difference < 0
			? `уменьшился на <code>${difference.toString().slice(1)}</code> см!`
			: difference > 0
				? `увеличился на <code>${difference}</code> см!`
				: "не изменился";

	return ctx.reply(`Ваш pp ${phrase} \n\nВаш текущий размер pp: <code>${size + difference}</code> см`, {
		parse_mode: "HTML",
	});
});

dickComposer.command("leaderboard", async ctx => {
	const allUsers = await ctx.database.select().from(dicks).orderBy(desc(dicks.size)).limit(10);
	if (allUsers.length < 0) return ctx.reply("Таблица лидеров пуста");

	const filtered = allUsers.filter(({ size }) => size > 0);
	const text = filtered.map(async (user, index) => {
		const user_data = await ctx.database.select().from(users).where(eq(users.user_id, user.user_id)).limit(1)!;
		const name =
			user_data[0]!.first_name + (user_data[0]?.last_name == undefined ? "" : ` ${user_data[0].last_name}`);

		return `<b>${index + 1}.</b> ${name}: <code>${user.size}</code> см`;
	});

	return ctx.reply((await Promise.all(text)).join("\n"), {
		parse_mode: "HTML",
	});
});
