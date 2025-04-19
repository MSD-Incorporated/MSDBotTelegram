import { defineConfig } from "drizzle-kit";

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE, DATABASE_URL } = process.env;

export default defineConfig({
	schema: "./src/drizzle/*",
	dialect: "postgresql",
	out: "./drizzle",
	dbCredentials: {
		host: "localhost",
		port: 5432,
		user: POSTGRES_USER,
		password: POSTGRES_PASSWORD,
		database: POSTGRES_DATABASE!,
		ssl: DATABASE_URL ? true : false,
	},
});
