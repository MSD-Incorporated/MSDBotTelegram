import { bigint, pgTable, serial } from "drizzle-orm/pg-core";

import { users } from "../user";
import { msdbot_user_backgrounds, msdbot_user_status, timestamps } from "../utils";

export const msdbot_users = pgTable("msdbot_users", {
	id: serial("id").unique(),
	user_id: bigint("user_id", { mode: "number" })
		.unique()
		.primaryKey()
		.references(() => users.user_id)
		.notNull(),
	status: msdbot_user_status("status").default("user").notNull(),
	background: msdbot_user_backgrounds("background").default("blue").notNull(),
	...timestamps,
});
