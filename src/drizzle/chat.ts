import { relations, type InferSelectModel } from "drizzle-orm";
import { bigint, boolean, pgEnum, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";
import { creationTimestamp, timestamps } from "./utils";

export const member_status = pgEnum("member_status", [
	"creator",
	"administrator",
	"member",
	"restricted",
	"left",
	"kicked",
]);

export const chat_type = pgEnum("type", ["group", "supergroup", "channel"]);

export const chats = pgTable("chats", {
	id: serial("id").unique().notNull(),
	chat_id: bigint("chat_id", { mode: "number" }).unique().primaryKey().notNull(),
	title: varchar("title", { length: 128 }).notNull(),
	type: chat_type("type").notNull(),
	username: varchar("username", { length: 32 }),
	is_forum: boolean("is_forum").default(false),
	...timestamps,
});

export type TChat = InferSelectModel<typeof chats>;

export const chat_users = pgTable("chat_users", {
	id: serial("id").unique().notNull(),
	chat_id: bigint("chat_id", { mode: "number" })
		.notNull()
		.references(() => chats.chat_id),
	user_id: bigint("user_id", { mode: "number" })
		.notNull()
		.references(() => users.user_id),
	status: member_status("status").default("member").notNull(),
	created_at: creationTimestamp,
});

export type TChatUsers = InferSelectModel<typeof chat_users>;

export const chatRelations = relations(chats, ({ many }) => ({
	users: many(chat_users, { relationName: "chat_chat_users" }),
}));

export const chatUserRelations = relations(chat_users, ({ one }) => ({
	chat: one(chats, { fields: [chat_users.chat_id], references: [chats.chat_id], relationName: "chat_chat_users" }),
	user: one(users, { fields: [chat_users.user_id], references: [users.user_id], relationName: "user_chat_users" }),
}));
