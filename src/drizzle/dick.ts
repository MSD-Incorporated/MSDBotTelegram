import { relations, type InferSelectModel } from "drizzle-orm";
import { bigint, integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

export const dicks = pgTable("dicks", {
	id: serial("id").notNull().unique(),
	user_id: bigint("user_id", { mode: "number" })
		.unique()
		.primaryKey()
		.references(() => users.user_id)
		.notNull(),
	size: integer("size").default(0).notNull(),
	timestamp: timestamp("timestamp", { mode: "date", precision: 3 }).default(new Date(0)).notNull(),
	created_at: timestamp("created_at", { mode: "date", precision: 3 }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { mode: "date", precision: 3 })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const dick_history = pgTable("dick_history", {
	id: serial("id").notNull().unique(),
	user_id: bigint("user_id", { mode: "number" })
		.references(() => dicks.user_id)
		.notNull(),
	size: integer("size").default(0).notNull(),
	difference: integer("difference").notNull(),
	created_at: timestamp("created_at", { mode: "date", precision: 3 }).defaultNow().notNull(),
});

export type TDick = InferSelectModel<typeof dicks>;
export type TDickHistory = InferSelectModel<typeof dick_history>;

export const dicksRelations = relations(dicks, ({ many }) => ({
	history: many(dick_history, {
		relationName: "dick_history",
	}),
}));

export const dicksHistoryRelations = relations(dick_history, ({ one }) => ({
	dick: one(dicks, {
		fields: [dick_history.user_id],
		references: [dicks.user_id],
		relationName: "dick_history",
	}),
}));
