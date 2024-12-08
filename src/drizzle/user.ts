import { InferSelectModel } from "drizzle-orm";
import { bigint, boolean, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").notNull().unique(),
	user_id: bigint("user_id", { mode: "number" }).notNull().unique().primaryKey(),
	first_name: varchar("first_name", { length: 64 }).notNull(),
	last_name: varchar("last_name", { length: 64 }),
	username: varchar("username", { length: 32 }),
	is_premium: boolean("is_premium").default(false).notNull(),
	status: varchar("status", { enum: ["user", "trusted", "owner"] })
		.default("user")
		.notNull(),
	created_at: timestamp("created_at", { mode: "date", precision: 3 }).defaultNow(),
	updated_at: timestamp("updated_at", { mode: "date", precision: 3 })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export type TUser = InferSelectModel<typeof users>;
