import { asc, desc, eq, sql } from "drizzle-orm";

import * as schema from "./drizzle";
import Database from "./index";
import type { ColumnRelation, IncludeRelation } from "./typings/types";
import type { TelegramUser } from "./user.system";

type DickParams<
	CreateIfNotExist extends boolean,
	Include extends IncludeRelation<"dicks">,
	Columns extends ColumnRelation<"dicks">,
> = Partial<{
	createIfNotExist?: CreateIfNotExist;
	include?: Include;
	columns?: Columns;
}>;

type HistoryParams<
	Include extends IncludeRelation<"dick_history">,
	Columns extends ColumnRelation<"dick_history">,
> = Partial<{
	include?: Include;
	columns?: Columns;
	limit?: number;
	orderBy?: "asc" | "desc";
	offset?: number;
}>;

export class DickSystem {
	private readonly database: (typeof Database)["db"];

	constructor(database: (typeof Database)["db"]) {
		this.database = database;
	}

	public async resolve<
		CreateIfNotExist extends boolean = false,
		Include extends IncludeRelation<"dicks"> = {},
		Columns extends ColumnRelation<"dicks"> = {},
	>(
		user: CreateIfNotExist extends true ? TelegramUser : { id: number },
		{ createIfNotExist, include, columns }: DickParams<CreateIfNotExist, Include, Columns> = {}
	) {
		const searchResult = await this.find<Include, Columns>(user, { include, columns });

		if (searchResult) return searchResult as Exclude<typeof searchResult, undefined>;

		if (createIfNotExist) {
			const payload = user as TelegramUser;
			const created = await this.create(payload);

			if (include && Object.keys(include).length > 0)
				return (await this.find<Include, Columns>(user, { include, columns }))!;

			return created as unknown as Exclude<typeof searchResult, undefined>;
		}

		return undefined as Exclude<typeof searchResult, undefined>;
	}

	public readonly find = async <
		Include extends IncludeRelation<"dicks"> = {},
		Columns extends ColumnRelation<"dicks"> = {},
	>(
		{ id }: { id: number },
		{ include, columns }: DickParams<false, Include, Columns> = {}
	) =>
		this.database.query["dicks"].findFirst({
			columns: columns as Columns,
			where: eq(schema.dicks.user_id, id),
			with: include as Include,
		});

	public readonly create = async (payload: TelegramUser) => {
		await this.database
			.insert(schema.users)
			.values({
				id: payload.id,
				first_name: payload.first_name,
				last_name: payload.last_name ?? null,
				username: payload.username ?? null,
				is_premium: payload.is_premium ?? false,
			})
			.onConflictDoNothing();

		return (
			await this.database
				.insert(schema.dicks)
				.values({
					user_id: payload.id,
					size: 0,
				})
				.onConflictDoNothing()
				.returning()
		)[0];
	};

	public readonly update = async (
		{ id }: { id: number },
		{ size, timestamp, referral_timestamp }: { size: number; timestamp?: Date; referral_timestamp?: Date }
	) => {
		return this.database
			.update(schema.dicks)
			.set({ size, timestamp, referral_timestamp })
			.where(eq(schema.dicks.user_id, id))
			.returning();
	};

	public readonly addHistory = async (
		{ id }: { id: number },
		size: number,
		difference: number,
		type?: "dick" | "dice" | "referral" | "transfer"
	) => {
		return (
			await this.database
				.insert(schema.dick_history)
				.values({
					user_id: id,
					size,
					difference,
					type,
				})
				.returning()
		)[0];
	};

	public readonly getHistory = async <
		Include extends IncludeRelation<"dick_history"> = {},
		Columns extends ColumnRelation<"dick_history"> = {},
	>(
		{ id }: { id: number },
		{ include, columns, limit = 10, orderBy = "desc", offset = 0 }: HistoryParams<Include, Columns> = {}
	) =>
		this.database.query["dick_history"].findMany({
			columns: columns as Columns,
			where: eq(schema.dick_history.user_id, id),
			with: include as Include,
			offset,
			orderBy: [orderBy === "asc" ? asc(schema.dick_history.created_at) : desc(schema.dick_history.created_at)],
			limit,
		});

	public readonly countHistory = async ({ id, offset = 0 }: { id: number; offset?: number }) => {
		return (
			(
				await this.database
					.select({ count: sql`count(*)`.mapWith(Number) })
					.from(schema.dick_history)
					.where(eq(schema.dick_history.user_id, id))
					.offset(offset)
			)[0]?.count ?? 0
		);
	};

	public readonly countLeaderboard = async () => {
		return (await this.database.select({ count: sql`count(*)`.mapWith(Number) }).from(schema.dicks))[0]?.count ?? 0;
	};

	public readonly getLeaderboard = async ({
		limit = 10,
		offset = 0,
		orderBy = "desc",
	}: {
		limit?: number;
		offset?: number;
		orderBy?: "asc" | "desc";
	}) => {
		return await this.database
			.select({ user_id: schema.dicks.user_id, size: schema.dicks.size })
			.from(schema.dicks)
			.orderBy(({ size }) => (orderBy === "asc" ? asc(size) : desc(size)))
			.limit(limit)
			.offset(offset);
	};
}
