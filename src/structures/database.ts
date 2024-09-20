import { and, eq, type DBQueryConfig, type ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import type { User as TelegramUser } from "typegram";
import * as schema from "../drizzle/index";

export type Schema = typeof schema;
export type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
	"one" | "many",
	boolean,
	TSchema,
	TSchema[TableName]
>["with"];

export class Database {
	readonly client = new Client({
		host: "localhost",
		port: 5432,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DB,
		ssl: process.env.DATABASE_URL ? true : false,
	});

	public db: NodePgDatabase<Schema>;

	constructor() {
		this.db = drizzle(this.client, { schema });
	}

	public readonly connect = async () => {
		await this.client.connect();
	};

	readonly resolveUser = async <
		U extends TelegramUser | { id: number },
		CINE extends boolean,
		I extends IncludeRelation<"users">,
	>(
		user: U,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		const searchResult = await this.db.query.users
			.findFirst({ where: eq(schema.users.user_id, user.id) })
			.execute();

		if (
			!searchResult &&
			createIfNotExists &&
			(user as TelegramUser)?.first_name &&
			(user as TelegramUser)?.last_name &&
			(user as TelegramUser)?.username
		) {
			await this.writeUser(user as TelegramUser);
		}

		return this.db.query.users.findFirst({ where: eq(schema.users.user_id, user.id), with: include }).execute();
	};

	readonly writeUser = async <U extends TelegramUser, D extends schema.TUser>(
		{ id, first_name, last_name, username }: U,
		data?: Partial<D>
	) => {
		this.db
			.insert(schema.users)
			.values({ ...data, user_id: id, first_name, last_name, username })
			.execute();
	};

	readonly updateUser = async <U extends TelegramUser, D extends schema.TUser>({ id }: U, data: Partial<D>) => {
		this.db.update(schema.users).set(data).where(eq(schema.users.user_id, id)).execute();
	};

	readonly resolveDick = async <
		U extends TelegramUser | { id: number },
		CINE extends boolean,
		I extends IncludeRelation<"dicks">,
	>(
		user: U,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		const searchResult = await this.db.query.dicks
			.findFirst({ where: eq(schema.dicks.user_id, user.id) })
			.execute();

		if (
			!searchResult &&
			createIfNotExists &&
			(user as TelegramUser)?.first_name &&
			(user as TelegramUser)?.last_name &&
			(user as TelegramUser)?.username
		) {
			await this.resolveUser(user as TelegramUser, true);
			await this.writeDick(user as TelegramUser);
		}

		return this.db.query.dicks.findFirst({ where: eq(schema.dicks.user_id, user.id), with: include }).execute();
	};

	readonly writeDick = async <U extends TelegramUser, D extends schema.TDick>({ id }: U, data?: Partial<D>) => {
		this.db
			.insert(schema.dicks)
			.values({ ...data, user_id: id })
			.execute();
	};

	readonly updateDick = async <U extends TelegramUser, D extends schema.TDick>({ id }: U, data: Partial<D>) => {
		this.db.update(schema.dicks).set(data).where(eq(schema.dicks.user_id, id)).execute();
	};

	readonly resolveDickHistory = async <
		U extends TelegramUser & { id: number },
		CINE extends boolean,
		I extends IncludeRelation<"dick_history">,
	>(
		user: U,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		const searchResult = await this.db.query.dick_history
			.findFirst({ where: eq(schema.dick_history.user_id, user.id) })
			.execute();

		if (
			!searchResult &&
			createIfNotExists &&
			(user as TelegramUser)?.first_name &&
			(user as TelegramUser)?.last_name &&
			(user as TelegramUser)?.username
		) {
			await this.resolveUser(user as TelegramUser, true);
			await this.resolveDick(user as TelegramUser, true);
			await this.writeDickHistory(user);
		}

		return this.db.query.dick_history
			.findMany({ where: eq(schema.dick_history.user_id, user.id), with: include })
			.execute();
	};

	readonly writeDickHistory = async <
		U extends { id: number; size?: number; difference?: number },
		D extends schema.TDickHistory,
	>(
		{ id, size, difference }: U,
		data?: Partial<D>
	) => {
		this.db
			.insert(schema.dick_history)
			.values({ ...data, user_id: id, size: size ?? 0, difference: difference ?? 0 })
			.execute();
	};

	readonly updateDickHistory = async <U extends TelegramUser & { dick_id: number }, D extends schema.TDickHistory>(
		{ id, dick_id }: U,
		data: Partial<D>
	) => {
		this.db
			.update(schema.dick_history)
			.set(data)
			.where(and(eq(schema.dick_history.user_id, id), eq(schema.dick_history.id, dick_id)))
			.execute();
	};
}
