import { bigint, pgTable, serial } from "drizzle-orm/pg-core";

import { users } from "../user";
import { creationTimestamp } from "../utils";

export const referrals = pgTable("referrals", {
	id: serial("id").unique(),
	referral: bigint("refferal", { mode: "number" })
		.unique()
		.primaryKey()
		.references(() => users.user_id)
		.notNull(),
	referrer: bigint("referrer", { mode: "number" })
		.references(() => users.user_id)
		.notNull(),
	created_at: creationTimestamp,
});
