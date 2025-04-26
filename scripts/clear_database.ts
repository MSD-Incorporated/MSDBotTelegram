import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "../src/drizzle";

const db = drizzle({
	client: Bun.sql,
	schema,
	connection: {
		ssl: false,
		host: process.env.POSTGRES_HOST,
		port: Number(process.env.POSTGRES_PORT),
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DATABASE,
	},
});

const clearDb = async (): Promise<void> => {
	const query = sql<string>`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;

	const tables = await db.execute(query);

	for (let table of tables) {
		const query = sql.raw(`TRUNCATE TABLE ${table.table_name} CASCADE;`);
		await db.execute(query);
	}
};

await clearDb();
