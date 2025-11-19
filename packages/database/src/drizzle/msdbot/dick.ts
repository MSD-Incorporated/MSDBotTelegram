import { bigint, integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

import { users } from "../user";
import { creationTimestamp, timestamps } from "../utils";

export const dicks = pgTable("dicks", {
	id: serial("id").unique(),
	user_id: bigint("user_id", { mode: "number" })
		.unique()
		.primaryKey()
		.references(() => users.id)
		.notNull(),
	size: integer("size").default(0).notNull(),
	timestamp: timestamp("timestamp", { mode: "date", precision: 3, withTimezone: true })
		.default(new Date(0))
		.notNull(),
	referral_timestamp: timestamp("referral_timestamp", { mode: "date", precision: 3, withTimezone: true })
		.default(new Date(0))
		.notNull(),
	...timestamps,
});

export const dick_history = pgTable("dick_history", {
	id: serial("id").notNull().unique(),
	user_id: bigint("user_id", { mode: "number" })
		.references(() => dicks.user_id)
		.notNull(),
	size: integer("size").default(0).notNull(),
	difference: integer("difference").notNull(),
	created_at: creationTimestamp,
});
