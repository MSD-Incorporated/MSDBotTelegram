import env from "@msdbot/env";
import { defineConfig } from "drizzle-kit";

const { USER, PASSWORD, DATABASE, URL } = env.DATABASE;

export default defineConfig({
	schema: "./src/drizzle/*",
	dialect: "postgresql",
	out: "./drizzle",
	dbCredentials: {
		host: process.env.HOST!,
		port: Number(process.env.PORT!),
		user: USER,
		password: PASSWORD,
		database: DATABASE!,
		url: URL ?? undefined,
		ssl: false,
	},
});
