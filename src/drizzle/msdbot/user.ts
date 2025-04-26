import { bigint, pgTable, serial } from "drizzle-orm/pg-core";
import { users } from "../user";
import { creationTimestamp, msdbot_user_status } from "../utils";

export const msdbot_user = pgTable("msdbot_user", {
	id: serial("id").notNull().unique(),
	user_id: bigint("user_id", { mode: "number" })
		.unique()
		.primaryKey()
		.references(() => users.user_id)
		.notNull(),
	status: msdbot_user_status("status").notNull(),
	created_at: creationTimestamp,
});
