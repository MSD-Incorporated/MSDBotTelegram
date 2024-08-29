import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/drizzle/*",
	dialect: "postgresql",
	out: "./drizzle",
	dbCredentials: {
		host: process.env.NODE_ENV == "production" ? "database" : "localhost",
		port: 5432,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: "msdbot_telegram",
		ssl: process.env.DATABASE_URL ? true : false,
	},
});
