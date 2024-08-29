import { drizzle, NodePgClient, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";

export class Database {
	readonly client = new Client({
		host: "localhost",
		port: 5432,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DB,
		ssl: process.env.DATABASE_URL ? true : false,
	});

	public db!: NodePgDatabase;

	constructor() {}

	public readonly connect = async () => {
		await this.client.connect();
		this.db = drizzle(this.client);
	};
}
