import { pgEnum, timestamp, type PgEnum } from "drizzle-orm/pg-core";

/**
 * User status in the bot.
 */
export const msdbot_user_status: PgEnum<["user", "trusted", "owner"]> = pgEnum("msdbot_user_status", [
	"user",
	"trusted",
	"owner",
]);

// /**
//  * Enum for member status in a chat.
//  */
// export const member_status: PgEnum<["creator", "administrator", "member", "restricted", "left", "kicked"]> = pgEnum(
// 	"member_status",
// 	["creator", "administrator", "member", "restricted", "left", "kicked"]
// );

// /**
//  * Enum for chat type.
//  */
// export const chat_type: PgEnum<["group", "supergroup", "channel", "private"]> = pgEnum("type", [
// 	"group",
// 	"supergroup",
// 	"channel",
// 	"private",
// ]);

/**
 * Timestamp for creation, defaults to current time and is non-nullable.
 */
export const creationTimestamp = timestamp("created_at", {
	mode: "date",
	precision: 3,
	withTimezone: true,
}).defaultNow();

/**
 * Timestamp for updates, defaults to current time, updates on change, and is non-nullable.
 */
export const updateTimestamp = timestamp("updated_at", { mode: "date", precision: 3, withTimezone: true })
	.defaultNow()
	.$onUpdate(() => new Date());

/**
 * Object containing creation and update timestamps.
 */
export const timestamps = { created_at: creationTimestamp, updated_at: updateTimestamp } as const;
