import { bigint, integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

export const dicks = pgTable("dicks", {
	id: serial("id").notNull().unique(),
	user_id: bigint("user_id", { mode: "number" })
		.notNull()
		.unique()
		.primaryKey()
		.references(() => users.user_id),
	size: integer("size").default(0).notNull(),
	created_at: timestamp("created_at", { mode: "date", precision: 3 }).defaultNow(),
	updated_at: timestamp("updated_at", { mode: "date", precision: 3 })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const dick_history = pgTable("dick_history", {
	id: serial("id").notNull().unique(),
	user_id: bigint("user_id", { mode: "number" })
		.notNull()
		.unique()
		.primaryKey()
		.references(() => users.user_id),
	size: integer("size").default(0).notNull(),
	difference: integer("difference").notNull(),
	created_at: timestamp("created_at", { mode: "date", precision: 3 }).defaultNow(),
});
