import type { InferSelectModel } from "drizzle-orm";
import { bigint, boolean, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").unique().notNull(),
	user_id: bigint("user_id", { mode: "number" }).unique().primaryKey().notNull(),
	first_name: varchar("first_name", { length: 64 }).notNull(),
	last_name: varchar("last_name", { length: 64 }),
	username: varchar("username", { length: 32 }),
	is_premium: boolean("is_premium").default(false).notNull(),
	status: varchar("status", { enum: ["user", "trusted", "owner"] })
		.default("user")
		.notNull(),
	created_at: timestamp("created_at", { mode: "date", precision: 3 }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { mode: "date", precision: 3 })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export type TUser = InferSelectModel<typeof users>;
