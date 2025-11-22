import { timestamp } from "drizzle-orm/pg-core";

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
