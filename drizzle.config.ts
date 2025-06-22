import { defineConfig } from "drizzle-kit";

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE, DATABASE_URL } = process.env;

export default defineConfig({
	schema: "./src/drizzle/*",
	dialect: "postgresql",
	out: "./drizzle",
	dbCredentials: {
		host: process.env.POSTGRES_HOST!,
		port: Number(process.env.POSTGRES_PORT!),
		user: POSTGRES_USER,
		password: POSTGRES_PASSWORD,
		database: POSTGRES_DATABASE!,
		url: DATABASE_URL ?? undefined,
		ssl: false,
	},
});
