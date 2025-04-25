import { timestamp } from "drizzle-orm/pg-core";

export const creationTimestamp = timestamp("created_at", { mode: "date", precision: 3, withTimezone: true })
	.defaultNow()
	.notNull();

export const updateTimestamp = timestamp("updated_at", { mode: "date", precision: 3, withTimezone: true })
	.defaultNow()
	.$onUpdate(() => new Date())
	.notNull();

export const timestamps = { created_at: creationTimestamp, updated_at: updateTimestamp } as const;
