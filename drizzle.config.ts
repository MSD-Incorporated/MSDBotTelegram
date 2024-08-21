import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/drizzle/*",
	dialect: "postgresql",
	out: "./drizzle",
	dbCredentials: {
		host: "localhost",
		port: 5432,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DB!,
		ssl: process.env.DATABASE_URL ? true : false,
	},
});
