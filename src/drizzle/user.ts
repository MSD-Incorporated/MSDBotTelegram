import { relations, type InferSelectModel } from "drizzle-orm";
import { bigint, boolean, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { chat_users } from "./chat";
import { dicks } from "./dick";
import { referrals } from "./refferals";

export const msdbot_user_status = pgEnum("msdbot_user_status", ["user", "trusted", "owner"]);

export const users = pgTable("users", {
	id: serial("id").unique().notNull(),
	user_id: bigint("user_id", { mode: "number" }).unique().primaryKey().notNull(),
	first_name: varchar("first_name", { length: 64 }).notNull(),
	last_name: varchar("last_name", { length: 64 }),
	username: varchar("username", { length: 32 }),
	is_premium: boolean("is_premium").default(false).notNull(),
	status: msdbot_user_status("status").default("user").notNull(),
	created_at: timestamp("created_at", { mode: "date", precision: 3, withTimezone: true }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { mode: "date", precision: 3, withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export type TUser = InferSelectModel<typeof users>;

export const user_buttons = pgTable("user_buttons", {
	id: serial("id").unique().notNull(),
	user_id: bigint("user_id", { mode: "number" })
		.references(() => users.user_id)
		.notNull(),
	link: varchar("link", { length: 256 }),
	text: varchar("text", { length: 256 }),
	created_at: timestamp("created_at", { mode: "date", precision: 3, withTimezone: true }).defaultNow().notNull(),
});

export type TUserButton = InferSelectModel<typeof user_buttons>;

export const userButtonsRelations = relations(user_buttons, ({ one }) => ({
	user: one(users, {
		fields: [user_buttons.user_id],
		references: [users.user_id],
		relationName: "user_buttons",
	}),
}));

export const userRelations = relations(users, ({ one, many }) => ({
	chats: many(chat_users, {
		relationName: "user_chat_users",
	}),
	referrals: many(referrals, {
		relationName: "referrals",
	}),
	buttons: many(user_buttons, {
		relationName: "user_buttons",
	}),
	dick: one(dicks, {
		fields: [users.user_id],
		references: [dicks.user_id],
	}),
}));
