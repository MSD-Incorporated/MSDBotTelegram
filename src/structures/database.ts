import { SQL } from "bun";
import { BunSQLDatabase, drizzle } from "drizzle-orm/bun-sql";

import { eq, type DBQueryConfig, type ExtractTablesWithRelations } from "drizzle-orm";
import type { User } from "grammy/types";
import * as schema from "../drizzle/index";

export type Schema = typeof schema;
export type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
	"one" | "many",
	boolean,
	TSchema,
	TSchema[TableName]
>["with"];

export type TelegramUser = Omit<User, "is_bot" | "language_code" | "added_to_attachment_menu"> | { id: number };

export class Database {
	public readonly client = new SQL({
		host: process.env.POSTGRES_HOST!,
		port: Number(process.env.POSTGRES_PORT!),
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DATABASE!,
		url: process.env.DATABASE_URL ?? undefined,
		ssl: false,
	});

	public readonly db: BunSQLDatabase<Schema>;

	constructor() {
		this.db = drizzle({ client: Bun.sql, schema });
	}

	public readonly connect = async () => {
		await this.client.connect();

		return this;
	};

	public readonly close = async () => {
		await this.client.close();

		return this;
	};

	public readonly resolveUser = async <
		U extends TelegramUser,
		CINE extends boolean,
		I extends IncludeRelation<"users">,
	>(
		user: CINE extends true ? TelegramUser : U,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		const searchResult = await this.db.query.users
			.findFirst({ where: eq(schema.users.user_id, user.id), with: include as I })
			.execute();

		if (!searchResult && createIfNotExists === true)
			return this.writeUser(user as User) as unknown as typeof searchResult;

		return searchResult;
	};

	readonly writeUser = async <U extends User, D extends TelegramUser, I extends IncludeRelation<"users">>(
		{ id, first_name, last_name, username, is_premium }: U,
		data?: Partial<D>,
		include: I = {} as I
	) => {
		await this.db
			.insert(schema.users)
			.values({ ...data, user_id: id, first_name, last_name, username, is_premium })
			.execute();

		return this.db.query.users.findFirst({ where: eq(schema.users.user_id, id), with: include }).execute();
	};
}
