import type { Context, NextFunction } from "grammy";
import { Database } from "../structures/database";

export const autoCaching = async (ctx: Context & { database: Database }, database: Database, next: NextFunction) => {
	ctx.database = database;

	const user = ctx.from;
	if (!user || user.is_bot || user.id == 777000) return next();

	const dbuser = await database.resolveUser(user!, true);

	if (
		user?.first_name !== dbuser?.first_name ||
		user?.last_name !== dbuser?.last_name ||
		user?.username !== dbuser?.username
	) {
		await database.updateUser(user!, {
			first_name: user?.first_name,
			last_name: user?.last_name,
			username: user?.username,
		});
	}

	return next();
};
