// import { bigint, boolean, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

// import { users } from "./user";
// import { chat_type, creationTimestamp, member_status, timestamps } from "./utils";

// export const chats = pgTable("chats", {
// 	id: serial("id").unique(),
// 	chat_id: bigint("chat_id", { mode: "number" }).unique().primaryKey().notNull(),
// 	title: varchar("title", { length: 128 }).notNull(),
// 	type: chat_type("type").notNull(),
// 	username: varchar("username", { length: 32 }),
// 	is_forum: boolean("is_forum").default(false),
// 	...timestamps,
// });

// export const chat_users = pgTable("chat_users", {
// 	id: serial("id").unique(),
// 	chat_id: bigint("chat_id", { mode: "number" })
// 		.notNull()
// 		.references(() => chats.chat_id),
// 	user_id: bigint("user_id", { mode: "number" })
// 		.notNull()
// 		.references(() => users.user_id),

// 	status: member_status("status").default("member").notNull(),
// 	custom_title: varchar("custom_title", { length: 255 }),
// 	is_anonymous: boolean("is_anonymous").default(false),
// 	can_be_edited: boolean("can_be_edited"),
// 	can_change_info: boolean("can_change_info"),
// 	can_delete_messages: boolean("can_delete_messages"),
// 	can_delete_stories: boolean("can_delete_stories"),
// 	can_edit_messages: boolean("can_edit_messages"),
// 	can_edit_stories: boolean("can_edit_stories"),
// 	can_invite_users: boolean("can_invite_users"),
// 	can_manage_chat: boolean("can_manage_chat"),
// 	can_manage_topics: boolean("can_manage_topics"),
// 	can_manage_video_chats: boolean("can_manage_video_chats"),
// 	can_pin_messages: boolean("can_pin_messages"),
// 	can_post_messages: boolean("can_post_messages"),
// 	can_post_stories: boolean("can_post_stories"),
// 	can_promote_members: boolean("can_promote_members"),
// 	can_restrict_members: boolean("can_restrict_members"),
// 	until_date: integer("until_date"),

// 	created_at: creationTimestamp,
// });
