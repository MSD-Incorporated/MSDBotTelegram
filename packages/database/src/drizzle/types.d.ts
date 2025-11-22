import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { users } from "./user";

/**
 * User types
 */
export type TUser = InferSelectModel<typeof users>;
export type TUserInsert = InferInsertModel<typeof users>;
