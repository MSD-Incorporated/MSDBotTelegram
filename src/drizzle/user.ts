import { bigint, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").notNull().unique(),
	user_id: bigint("user_id", { mode: "number" }).notNull().unique().primaryKey(),
	first_name: varchar("first_name", { length: 64 }).notNull(),
	last_name: varchar("last_name", { length: 64 }),
});
