import type { NextFunction } from "grammy";

import type { Database } from "../structures/database";
import type { Context } from "./context";

export const autoUserCaching = async (
	ctx: Context & { database: Database },
	database: Database,
	next: NextFunction
) => {
	ctx.database = database;

	const user = ctx.from;
	if (!user || user.is_bot || user.id == 777000) return next();

	const dbuser = await database.resolveUser(user, true);

	if (
		user.first_name != dbuser.first_name ||
		user.last_name != dbuser.last_name ||
		user.username != dbuser.username ||
		user.is_premium != dbuser.is_premium
	) {
		await database.updateUser(user!, {
			first_name: user.first_name,
			last_name: user.last_name ?? null,
			username: user.username ?? null,
			is_premium: user.is_premium,
		});

		return next();
	}

	return next();
};
