import { SQL } from "bun";
import { BunSQLDatabase, drizzle } from "drizzle-orm/bun-sql";

import { eq, type DBQueryConfig, type ExtractTablesWithRelations } from "drizzle-orm";
import type { TDick, TReferral, TUser } from "drizzle/types";
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

	public readonly resolveDick = async <
		U extends CINE extends false
			? TelegramUser
			: Omit<User, "is_bot" | "language_code" | "added_to_attachment_menu">,
		CINE extends boolean,
		I extends IncludeRelation<"dicks">,
	>(
		user: U,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		const where = eq(schema.dicks.user_id, user.id);
		const searchResult = await this.db.query.dicks.findFirst({ where, with: include as I }).execute();

		if (!searchResult && createIfNotExists) {
			await this.resolveUser(user as User, true);
			return this.writeDick(user as User) as unknown as typeof searchResult;
		}

		return searchResult;
	};

	readonly writeDick = async <U extends User, D extends TUser, I extends IncludeRelation<"dicks">>(
		{ id }: U,
		data?: Partial<D>,
		include: I = {} as I
	) => {
		const values = { ...data, user_id: id };
		const where = eq(schema.dicks.user_id, id);

		await this.db.insert(schema.dicks).values(values).execute();
		return this.db.query.dicks.findFirst({ where, with: include }).execute();
	};

	readonly updateDick = async <U extends TelegramUser, D extends TDick>({ id }: U, data: Partial<D>) => {
		return this.db.update(schema.dicks).set(data).where(eq(schema.dicks.user_id, id)).execute();
	};

	public readonly resolveUser = async <
		U extends CINE extends false
			? TelegramUser
			: Omit<User, "is_bot" | "language_code" | "added_to_attachment_menu">,
		CINE extends boolean,
		I extends IncludeRelation<"users">,
	>(
		user: U,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		const where = eq(schema.users.user_id, user.id);
		const searchResult = await this.db.query.users.findFirst({ where, with: include as I }).execute();

		if (!searchResult && createIfNotExists) return this.writeUser(user as User) as unknown as typeof searchResult;

		return searchResult;
	};

	readonly writeUser = async <U extends User, D extends TUser, I extends IncludeRelation<"users">>(
		{ id, first_name, last_name, username, is_premium }: U,
		data?: Partial<D>,
		include: I = {} as I
	) => {
		const values = { ...data, user_id: id, first_name, last_name, username, is_premium };
		const where = eq(schema.users.user_id, id);

		await this.db.insert(schema.users).values(values).execute();
		return this.db.query.users.findFirst({ where, with: include }).execute();
	};

	readonly updateUser = async <U extends TelegramUser, D extends TUser>({ id }: U, data: Partial<D>) => {
		return this.db.update(schema.users).set(data).where(eq(schema.users.user_id, id)).execute();
	};

	/**
	 * Resolves referrers of user
	 */
	readonly resolveReferrals = async <U extends TelegramUser, I extends IncludeRelation<"referrals">>(
		{ id }: U,
		include: I = {} as I
	) => {
		return this.db.query.referrals.findMany({ where: eq(schema.referrals.referral, id), with: include }).execute();
	};

	/**
	 * Resolves referrer by id
	 */
	readonly resolveReferrer = async <U extends TelegramUser, I extends IncludeRelation<"referrals">>(
		{ id }: U,
		include: I = {} as I
	) => {
		return this.db.query.referrals.findFirst({ where: eq(schema.referrals.referrer, id), with: include }).execute();
	};

	readonly writeReferral = async <U extends TelegramUser, D extends TReferral>(
		referral: U,
		referrer: U,
		data?: Omit<Partial<D>, "referral" | "referrer">
	) => {
		return this.db
			.insert(schema.referrals)
			.values({ ...data, referral: referral.id, referrer: referrer.id })
			.execute();
	};
}
