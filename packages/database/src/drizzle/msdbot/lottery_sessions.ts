import { bigint, boolean, jsonb, pgTable, uuid } from "drizzle-orm/pg-core";

import { users } from "../user";
import { creationTimestamp } from "../utils";

export const lotterySessions = pgTable("lottery_sessions", {
	id: uuid("id").primaryKey(),
	user_id: bigint("user_id", { mode: "number" })
		.references(() => users.id)
		.notNull(),
	prizes: jsonb("prizes").$type<string[]>().notNull(),
	active: boolean("active").default(true).notNull(),
	created_at: creationTimestamp,
});
