import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export default createEnv({
	server: {
		BOT_TOKEN: z.string().min(1),
		TELEGRAPH_TOKEN: z.string().min(1),
		SAUCENAO_TOKEN: z.string().min(1),

		LOCAL_API: z.string().min(1),

		POSTGRES_USER: z.string().min(1),
		POSTGRES_PASSWORD: z.string().min(1),
		POSTGRES_DB: z.string().min(1),
		POSTGRES_HOST: z.string().min(1),
		POSTGRES_PORT: z.string().min(1),
		DATABASE_URL: z.string().min(1),

		NODE_ENV: z.enum(["dev", "prod"]).default("dev"),
		TZ: z.string().min(1),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: process.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: false,
});
