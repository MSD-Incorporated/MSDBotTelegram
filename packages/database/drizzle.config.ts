import env from "@msdbot/env";
import { defineConfig } from "drizzle-kit";

const { HOST, PORT, USER, PASSWORD, DATABASE, URL } = env.DATABASE;

export default defineConfig({
	schema: "./src/drizzle/*",
	dialect: "postgresql",
	out: "./drizzle",
	dbCredentials: { host: HOST, port: PORT, user: USER, password: PASSWORD, database: DATABASE, url: URL, ssl: false },
});
