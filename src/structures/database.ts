import { SQL } from "bun";
import { eq, type DBQueryConfig, type ExtractTablesWithRelations } from "drizzle-orm";
import { BunSQLDatabase, drizzle } from "drizzle-orm/bun-sql";
import type { User } from "grammy/types";

import * as schema from "../drizzle/index";
import type { TDick, TDickHistory, TReferral, TUser } from "../drizzle/types";
import { dateFormatter, normalizeName } from "../utils";
import type { Logger } from "./logger";

export type Schema = typeof schema;
export type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
	"one" | "many",
	boolean,
	TSchema,
	TSchema[TableName]
>["with"];

export type TelegramUser = Omit<User, "is_bot" | "language_code" | "added_to_attachment_menu"> | { id: number };

/**
 * Database class that provides methods for working with the database.
 */
export class Database {
	/**
	 * The logger instance.
	 */
	public readonly logger: Logger;

	/**
	 * The underlying SQL client.
	 */
	public readonly client: SQL;

	/**
	 * The database instance.
	 */
	public readonly db: BunSQLDatabase<Schema>;

	/**
	 * Creates a new instance of the Database class.
	 */
	constructor(logger: Logger) {
		this.client = new SQL({
			host: process.env.POSTGRES_HOST!,
			port: Number(process.env.POSTGRES_PORT!),
			user: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DATABASE!,
			url: process.env.DATABASE_URL ?? undefined,
			ssl: false,
		});

		this.logger = logger;
		this.db = drizzle({ client: Bun.sql, schema });
	}

	/**
	 * Establishes a connection to the database.
	 */
	public readonly connect = async () => {
		await this.client.connect();

		this.logger.custom(
			this.logger.ck.magentaBright(
				this.logger.icons["menu"],
				"Connected to database:",
				`"${process.env.DATABASE_URL.split("/")[3]}"`
			)
		);

		return this;
	};

	/**
	 * Closes the connection to the database.
	 */
	public readonly close = async () => {
		await this.client.close();

		this.logger.custom(
			this.logger.ck.magentaBright(
				this.logger.icons["menu"],
				"Disconnected from database:",
				`"${process.env.DATABASE_URL.split("/")[3]}"`
			)
		);

		return this;
	};

	/**
	 * Finds a user by their Telegram ID, or creates a new user if the user does not exist.
	 *
	 * @param user The Telegram user.
	 * @param createIfNotExists Whether to create a new user if the user does not exist.
	 * @param include The relations to include in the result.
	 * @returns The user.
	 */
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
		let searchResult = await this.db.query.users.findFirst({ where, with: include as I }).execute();

		if (!searchResult && (createIfNotExists as unknown as CINE extends true ? true : false)) {
			return this.writeUser(user as User) as unknown as CINE extends true
				? Exclude<typeof searchResult, undefined>
				: typeof searchResult;
		}

		return searchResult as Exclude<typeof searchResult, undefined>;
	};

	/**
	 * Finds a dick by their user ID, or creates a new dick if the dick does not exist.
	 *
	 * @param user The user.
	 * @param createIfNotExists Whether to create a new dick if the dick does not exist.
	 * @param include The relations to include in the result.
	 * @returns The dick.
	 */
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

		if (!searchResult && (createIfNotExists as unknown as CINE extends true ? true : false)) {
			await this.resolveUser(user as User, true);
			return this.writeDick(user as TDick) as unknown as CINE extends true
				? Exclude<typeof searchResult, undefined>
				: typeof searchResult;
		}

		return searchResult as Exclude<typeof searchResult, undefined>;
	};

	public readonly resolveDickHistory = async <
		U extends CINE extends false
			? TelegramUser
			: Omit<User, "is_bot" | "language_code" | "added_to_attachment_menu">,
		CINE extends boolean,
		I extends IncludeRelation<"dick_history">,
	>(
		user: U,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		const where = eq(schema.dick_history.user_id, user.id);
		const searchResult = await this.db.query.dick_history.findMany({ where, with: include as I }).execute();

		if (!searchResult && (createIfNotExists as unknown as CINE extends true ? true : false)) {
			await this.resolveUser(user as User, true);
			await this.resolveDick(user as User, true);

			return this.writeDickHistory(user) as unknown as CINE extends true
				? Exclude<typeof searchResult, undefined>
				: typeof searchResult;
		}

		return searchResult as Exclude<typeof searchResult, undefined>;
	};

	public readonly writeDickHistory = async <
		U extends { id: number; size?: number; difference?: number },
		D extends TDickHistory,
		I extends IncludeRelation<"users">,
	>(
		{ id, size, difference }: U,
		data?: Partial<D>,
		include: I = {} as I
	) => {
		const values = { ...data, user_id: id, size: size ?? 0, difference: difference ?? 0 };
		const where = eq(schema.dick_history.user_id, id);

		this.logger.custom(
			this.logger.ck.grey(this.logger.icons["menu"], `📃 Creating new dick history entry for id`),
			this.logger.ck.grey("[") + this.logger.ck.greenBright(id) + this.logger.ck.grey("]"),
			this.logger.ck.grey("with size"),
			this.logger.ck.greenBright(size ?? 0),
			this.logger.ck.grey("and difference"),
			this.logger.ck.greenBright(difference ?? 0)
		);

		await this.db.insert(schema.dick_history).values(values).execute();
		return this.db.query.dick_history.findMany({ where, with: include as I }).execute();
	};

	/**
	 * Writes a new user to the database.
	 *
	 * @param user The user to write.
	 * @param data The data to write.
	 * @param include The relations to include in the result.
	 * @returns The written user.
	 */
	public readonly writeUser = async <U extends User, D extends TUser, I extends IncludeRelation<"users">>(
		{ id, first_name, last_name, username, is_premium }: U,
		data?: Partial<D>,
		include: I = {} as I
	) => {
		const values = { ...data, user_id: id, first_name, last_name, username, is_premium };
		const where = eq(schema.users.user_id, id);

		this.logger.custom(
			this.logger.ck.grey(this.logger.icons["menu"], `➕ Creating new user`),
			this.logger.ck.greenBright(normalizeName({ first_name, last_name })),
			this.logger.ck.grey("[") + this.logger.ck.greenBright(id) + this.logger.ck.grey("]")
		);

		await this.db.insert(schema.users).values(values).execute();
		return this.db.query.users.findFirst({ where, with: include as I }).execute();
	};

	/**
	 * Writes a new dick to the database.
	 *
	 * @param user The user to write.
	 * @param data The data to write.
	 * @param include The relations to include in the result.
	 * @returns The written dick.
	 */
	public readonly writeDick = async <U extends TelegramUser, D extends TDick, I extends IncludeRelation<"dicks">>(
		{ id }: U,
		data?: Partial<D>,
		include: I = {} as I
	) => {
		const values = { ...data, user_id: id };
		const where = eq(schema.dicks.user_id, id);

		this.logger.custom(
			this.logger.ck.grey(this.logger.icons["menu"], `🍆 Creating new dick for id`),
			this.logger.ck.grey("[") + this.logger.ck.greenBright(id) + this.logger.ck.grey("]")
		);

		await this.db.insert(schema.dicks).values(values).execute();
		return this.db.query.dicks.findFirst({ where, with: include as I }).execute();
	};

	/**
	 * Updates a user in the database.
	 *
	 * @param user The user to update.
	 * @param data The data to update.
	 * @returns The updated user.
	 */
	public readonly updateUser = async <U extends TelegramUser, D extends TUser>({ id }: U, data: Partial<D>) => {
		this.logger.custom(
			this.logger.ck.grey(this.logger.icons["menu"], `📝 Updating user with id`),
			this.logger.ck.grey("[") + this.logger.ck.greenBright(id) + this.logger.ck.grey("]"),
			this.logger.ck.grey("with data"),
			this.logger.ck.greenBright(
				JSON.stringify(
					`first_name: ${data.first_name}, last_name: ${data.last_name ?? "null"}, username: ${data.username ?? "null"}`
				)
			)
		);

		return this.db.update(schema.users).set(data).where(eq(schema.users.user_id, id)).execute();
	};

	/**
	 * Updates a dick in the database.
	 *
	 * @param user The user to update.
	 * @param data The data to update.
	 * @returns The updated dick.
	 */
	public readonly updateDick = async <U extends TelegramUser, D extends TDick>({ id }: U, data: Partial<D>) => {
		this.logger.custom(
			this.logger.ck.grey(this.logger.icons["menu"], `📝 Updating dick for id`),
			this.logger.ck.grey("[") + this.logger.ck.greenBright(id) + this.logger.ck.grey("]"),
			this.logger.ck.grey("with data"),
			this.logger.ck.greenBright(
				JSON.stringify(
					`size: ${data.size}, referral_timestamp: ${data.referral_timestamp ? dateFormatter.format(data.referral_timestamp) : null}, timestamp: ${data.timestamp ? dateFormatter.format(data.timestamp) : null}`
				)
			)
		);

		return this.db.update(schema.dicks).set(data).where(eq(schema.dicks.user_id, id)).execute();
	};

	/**
	 * Finds all referrers of a user.
	 *
	 * @param user The user to find referrers for.
	 * @param include The relations to include in the result.
	 * @returns The referrers.
	 */
	public readonly resolveReferrals = async <U extends TelegramUser, I extends IncludeRelation<"referrals">>(
		{ id }: U,
		include: I = {} as I
	) => {
		return this.db.query.referrals
			.findMany({ where: eq(schema.referrals.referral, id), with: include as I })
			.execute();
	};

	/**
	 * Finds a referrer by their ID.
	 *
	 * @param user The user to find referrer for.
	 * @param include The relations to include in the result.
	 * @returns The referrer.
	 */
	public readonly resolveReferrer = async <U extends TelegramUser, I extends IncludeRelation<"referrals">>(
		{ id }: U,
		include: I = {} as I
	) => {
		return this.db.query.referrals
			.findFirst({ where: eq(schema.referrals.referrer, id), with: include as I })
			.execute();
	};

	/**
	 * Writes a new referral to the database.
	 *
	 * @param referral The referral.
	 * @param referrer The referrer.
	 * @param data The data to write.
	 * @returns The written referral.
	 */
	public readonly writeReferral = async <U extends TelegramUser, D extends TReferral>(
		referral: U,
		referrer: U,
		data?: Omit<Partial<D>, "referral" | "referrer">
	) => {
		this.logger.custom(
			this.logger.ck.grey(this.logger.icons["menu"], `👥 Creating new referral for id`),
			this.logger.ck.grey("[") + this.logger.ck.greenBright(referrer.id) + this.logger.ck.grey("]"),
			this.logger.ck.grey("with referral"),
			this.logger.ck.grey("[") + this.logger.ck.greenBright(referral.id) + this.logger.ck.grey("]")
		);

		return this.db
			.insert(schema.referrals)
			.values({ ...data, referral: referral.id, referrer: referrer.id })
			.execute();
	};
}
