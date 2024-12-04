// TODO: Recode

import { and, eq, type DBQueryConfig, type ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
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

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DATABASE_URL } = process.env;

export class Database {
	readonly client = new Client({
		host: "localhost",
		port: 5432,
		user: POSTGRES_USER,
		password: POSTGRES_PASSWORD,
		database: POSTGRES_DB,
		ssl: DATABASE_URL ? true : false,
	});

	public db: NodePgDatabase<Schema>;

	constructor() {
		this.db = drizzle(this.client, { schema });
	}

	public readonly connect = async () => {
		await this.client.connect();
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

		if (!searchResult && createIfNotExists && (user as TelegramUser)?.first_name) {
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

		if (!searchResult && createIfNotExists && (user as TelegramUser)?.first_name) {
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
			.findFirst({ where: eq(schema.users.user_id, user.id), with: include })
			.execute();

		if (!searchResult && createIfNotExists && (user as TelegramUser)?.first_name) {
			await this.writeUser(user as TelegramUser);
		}

		return this.db.query.users.findFirst({ where: eq(schema.users.user_id, user.id), with: include }).execute();
	};

	readonly writeUser = async <U extends TelegramUser, D extends schema.TUser>(
		{ id, first_name, last_name, username, is_premium }: U,
		data?: Partial<D>
	) => {
		this.db
			.insert(schema.users)
			.values({ ...data, user_id: id, first_name, last_name, username, is_premium })
			.execute();
	};

	readonly updateUser = async <U extends TelegramUser, D extends schema.TUser>({ id }: U, data: Partial<D>) => {
		this.db.update(schema.users).set(data).where(eq(schema.users.user_id, id)).execute();
	};

	/**
	 * Resolves referrers of user
	 */
	readonly resolveReferrers = async <U extends TelegramUser & { id: number }, I extends IncludeRelation<"referrals">>(
		{ id }: U,
		include: I = {} as I
	) => {
		return this.db.query.referrals.findMany({ where: eq(schema.referrals.referral, id), with: include }).execute();
	};

	/**
	 * Resolves referrer by id
	 */
	readonly resolveReferrer = async <U extends TelegramUser & { id: number }, I extends IncludeRelation<"referrals">>(
		{ id }: U,
		include: I = {} as I
	) => {
		return this.db.query.referrals.findFirst({ where: eq(schema.referrals.referrer, id), with: include }).execute();
	};

	readonly writeReferral = async <U extends TelegramUser & { id: number }, D extends schema.TRefferal>(
		referral: U,
		referrer: U,
		data?: Partial<D>
	) => {
		this.db
			.insert(schema.referrals)
			.values({ ...data, referral: referral.id, referrer: referrer.id })
			.execute();
	};
}
