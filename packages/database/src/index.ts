import env from "@msdbot/env";
import { SQL } from "bun";
import { type ExtractTablesWithRelations, type Logger } from "drizzle-orm";
import { BunSQLDatabase, drizzle } from "drizzle-orm/bun-sql";

import { DickSystem } from "./dick.system";
import * as schema from "./drizzle/index";
import { ReferralSystem } from "./referrals.system";
import { UserSystem } from "./user.system";

export type Schema = typeof schema;
export type TSchema = ExtractTablesWithRelations<Schema>;

export class JsonLogger implements Logger {
	private readonly pretty: boolean;

	constructor(pretty: boolean = false) {
		this.pretty = pretty;
	}

	logQuery(query: string, params: unknown[]): void {
		const logEntry = {
			timestamp: new Date().toISOString(),
			level: "info",
			component: "database",
			query: query.replace(/\s+/g, " ").trim(),
			params,
		};

		console.log(JSON.stringify(logEntry, null, this.pretty ? 4 : undefined));
	}
}

export class Database {
	/**
	 * The underlying SQL client.
	 */
	public readonly client: SQL;

	/**
	 * The database instance.
	 */
	public readonly db: BunSQLDatabase<Schema>;

	public readonly users: UserSystem;
	public readonly dicks: DickSystem;
	public readonly referrals: ReferralSystem;

	/**
	 * Creates a new instance of the Database class.
	 */
	constructor() {
		this.client = new SQL({
			host: env.DATABASE.HOST,
			port: Number(env.DATABASE.PORT),
			user: env.DATABASE.USER,
			password: env.DATABASE.PASSWORD,
			database: env.DATABASE.DATABASE,
			url: env.DATABASE.URL ?? undefined,
			ssl: false,
		});

		this.db = drizzle(this.client, {
			schema,
			logger: new JsonLogger(env.NODE_ENV !== "prod"),
		});
		this.users = new UserSystem(this.db);
		this.dicks = new DickSystem(this.db);
		this.referrals = new ReferralSystem(this.db);
	}

	/**
	 * Establishes a connection to the database.
	 */
	public readonly connect = async () => {
		await this.client.connect();

		console.log("Database connected!");

		return this;
	};

	/**
	 * Closes the connection to the database.
	 */
	public readonly close = async () => {
		await this.client.close();

		console.log("Database disconnected!");

		return this;
	};
}

export * from "drizzle-orm";
export * from "./drizzle/index";

export { DickSystem } from "./dick.system";
export { UserSystem } from "./user.system";

export default new Database();
