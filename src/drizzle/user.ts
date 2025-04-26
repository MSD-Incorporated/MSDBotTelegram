import { bigint, boolean, pgTable, serial, varchar } from "drizzle-orm/pg-core";

import { timestamps } from "./utils";

export const users = pgTable("users", {
	id: serial("id").unique(),
	user_id: bigint("user_id", { mode: "number" }).unique().primaryKey().notNull(),
	first_name: varchar("first_name", { length: 64 }).notNull(),
	last_name: varchar("last_name", { length: 64 }),
	username: varchar("username", { length: 32 }),
	is_premium: boolean("is_premium").default(false).notNull(),
	...timestamps,
});

// export const user_buttons = pgTable("user_buttons", {
// 	id: serial("id").unique(),
// 	user_id: bigint("user_id", { mode: "number" })
// 		.references(() => users.user_id)
// 		.notNull(),
// 	link: varchar("link", { length: 256 }),
// 	text: varchar("text", { length: 256 }),
// 	created_at: creationTimestamp,
// });
