import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		BOT_TOKEN: z.string().min(1),
		LOCAL_API: z.string().or(z.undefined()).optional(),

		SAUCENAO_TOKEN: z.string().min(1),
		GELBOORU_USER_ID: z.string().min(1),
		GELBOORU_API_KEY: z.string().min(1),

		POSTGRES_USER: z.string().min(1),
		POSTGRES_PASSWORD: z.string().min(1),
		POSTGRES_DB: z.string().min(1),
		POSTGRES_HOST: z.string().min(1),
		POSTGRES_PORT: z.coerce.number().default(5432),

		NODE_ENV: z.enum(["dev", "prod"]),
		TZ: z.string().min(1),
	},
	runtimeEnv: {
		BOT_TOKEN: process.env.BOT_TOKEN,
		LOCAL_API: process.env.LOCAL_API,

		SAUCENAO_TOKEN: process.env.SAUCENAO_TOKEN ?? undefined,
		GELBOORU_USER_ID: process.env.GELBOORU_USER_ID ?? undefined,
		GELBOORU_API_KEY: process.env.GELBOORU_API_KEY ?? undefined,

		POSTGRES_USER: process.env.POSTGRES_USER,
		POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
		POSTGRES_DB: process.env.POSTGRES_DB,
		POSTGRES_HOST: process.env.POSTGRES_HOST,
		POSTGRES_PORT: process.env.POSTGRES_PORT,

		NODE_ENV: process.env.NODE_ENV,
		TZ: process.env.TZ,
	},
});

const createConfig = () => ({
	BOT_TOKEN: env.BOT_TOKEN,
	LOCAL_API: env.LOCAL_API ?? undefined,
	MSDINC: {
		SAUCENAO_TOKEN: env.SAUCENAO_TOKEN,
		GELBOORU_USER_ID: env.GELBOORU_USER_ID,
		GELBOORU_API_KEY: env.GELBOORU_API_KEY,
	},
	DATABASE: {
		USER: env.POSTGRES_USER,
		PASSWORD: env.POSTGRES_PASSWORD,
		DATABASE: env.POSTGRES_DB,
		HOST: env.POSTGRES_HOST,
		PORT: env.POSTGRES_PORT,
		URL: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
	},
	NODE_ENV: process.env.NODE_ENV,
	TZ: env.TZ,
});

export default createConfig();
