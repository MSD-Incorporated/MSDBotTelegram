import { eq } from "drizzle-orm";
import type { User } from "typegram";

import * as schema from "./drizzle";
import type { TUserInsert } from "./drizzle/types";
import Database from "./index";
import type { ColumnRelation, IncludeRelation, TSchema } from "./typings/types";

export type TelegramUser = Omit<User, "is_bot" | "language_code" | "added_to_attachment_menu">;
export type UserParams<
	TableName extends keyof TSchema,
	CreateIfNotExist extends boolean,
	Include extends IncludeRelation<TableName>,
	Columns extends ColumnRelation<TableName>,
> = Partial<{
	createIfNotExist?: CreateIfNotExist;
	include?: Include;
	columns?: Columns;
}>;

export class UserSystem {
	private readonly database: (typeof Database)["db"];

	constructor(database: (typeof Database)["db"]) {
		this.database = database;
	}

	public async resolve<
		CreateIfNotExist extends boolean = false,
		Include extends IncludeRelation<"users"> = {},
		Columns extends ColumnRelation<"users"> = {},
	>(
		user: CreateIfNotExist extends true ? TelegramUser : { id: number },
		{ createIfNotExist, include, columns }: UserParams<"users", CreateIfNotExist, Include, Columns> = {}
	) {
		const searchResult = await this.find<Include, Columns>(user, { include, columns });

		if (searchResult) return searchResult as Exclude<typeof searchResult, undefined>;

		if (createIfNotExist) {
			const payload = user as TelegramUser;
			const created = await this.upsert(payload);

			if (include && Object.keys(include).length > 0)
				return (await this.find<Include, Columns>(user, { include, columns }))! as Exclude<
					typeof searchResult,
					undefined
				>;

			return created as unknown as Exclude<typeof searchResult, undefined>;
		}

		return undefined as Exclude<typeof searchResult, undefined>;
	}

	public readonly find = async <
		Include extends IncludeRelation<"users"> = {},
		Columns extends ColumnRelation<"users"> = {},
	>(
		data: { id: number; username?: string } | { id?: number; username: string },
		{ include, columns }: UserParams<"users", false, Include, Columns> = {}
	) =>
		this.database.query["users"].findFirst({
			columns: columns as Columns,
			where:
				data.username === undefined
					? eq(schema.users.id, data.id!)
					: eq(schema.users.username, (data.username ?? "").replace("@", "")),
			with: include as Include,
		});

	public readonly upsert = async (payload: TelegramUser) => {
		return (
			await this.database
				.insert(schema.users)
				.values({
					id: payload.id,
					first_name: payload.first_name,
					last_name: payload.last_name ?? null,
					username: payload.username ?? null,
					is_premium: payload.is_premium ?? false,
				})
				.onConflictDoUpdate({
					target: schema.users.id,
					set: {
						first_name: payload.first_name,
						last_name: payload.last_name ?? null,
						username: payload.username ?? null,
						is_premium: payload.is_premium ?? false,
					},
				})
				.returning()
		)[0];
	};

	public readonly update = async ({ id }: { id: number }, payload: TUserInsert) => {
		return (await this.database.update(schema.users).set(payload).where(eq(schema.users.id, id)).returning())[0];
	};
}
