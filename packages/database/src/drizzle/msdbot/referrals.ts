import { bigint, pgTable, serial } from "drizzle-orm/pg-core";

import { users } from "../user";
import { creationTimestamp } from "../utils";

export const referrals = pgTable("referrals", {
	id: serial("id").unique(),
	referral: bigint("refeкral", { mode: "number" })
		.unique()
		.primaryKey()
		.references(() => users.id)
		.notNull(),
	referrer: bigint("referrer", { mode: "number" })
		.references(() => users.id)
		.notNull(),
	created_at: creationTimestamp,
});
