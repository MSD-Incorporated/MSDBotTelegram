import { bigint, boolean, pgTable, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "./utils";

export const users = pgTable("users", {
	id: bigint("id", { mode: "number" }).unique().primaryKey().notNull(),
	first_name: varchar("first_name", { length: 64 }).notNull(),
	last_name: varchar("last_name", { length: 64 }),
	username: varchar("username", { length: 32 }),
	is_premium: boolean("is_premium").default(false),
	...timestamps,
});
