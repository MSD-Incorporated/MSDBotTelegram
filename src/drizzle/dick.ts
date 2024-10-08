import type { InferSelectModel } from "drizzle-orm";
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
	timestamp: timestamp("timestamp", { mode: "date", precision: 3 }).default(new Date(0)).notNull(),
	created_at: timestamp("created_at", { mode: "date", precision: 3 }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { mode: "date", precision: 3 })
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const dick_history = pgTable("dick_history", {
	id: serial("id").notNull().unique(),
	user_id: bigint("user_id", { mode: "number" })
		.notNull()
		.references(() => dicks.user_id),
	size: integer("size").default(0).notNull(),
	difference: integer("difference").notNull(),
	created_at: timestamp("created_at", { mode: "date", precision: 3 }).defaultNow(),
});

export type TDick = InferSelectModel<typeof dicks>;
export type TDickHistory = InferSelectModel<typeof dick_history>;
