import env from "@msdbot/env";
import { defineConfig } from "drizzle-kit";

const { HOST, PORT, USER, PASSWORD, DATABASE, URL,} = env.DATABASE;

export default defineConfig({
	schema: "./src/drizzle/*",
	dialect: "postgresql",
	out: "./drizzle",
	dbCredentials: {
		host: HOST ?? "localhost",
		port: PORT ?? 5432,
		user: USER,
		password: PASSWORD,
		database: DATABASE!,
		url: URL ?? undefined,
		ssl: false,
	},
});
