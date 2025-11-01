import arkenv, { type } from "arkenv";

export const env = arkenv({
	BOT_TOKEN: type("string").atLeastLength(1),
	TELEGRAPH_TOKEN: type("string").atLeastLength(1),
	SAUCENAO_TOKEN: type("string").atLeastLength(1),

	LOCAL_API: type("string.url").atLeastLength(1),

	POSTGRES_USER: type("string").atLeastLength(1),
	POSTGRES_PASSWORD: type("string").atLeastLength(1),
	POSTGRES_DB: type("string").atLeastLength(1),
	POSTGRES_HOST: type("string").atLeastLength(1),
	POSTGRES_PORT: type("number.port"),
	DATABASE_URL: type("string.url").atLeastLength(1),

	NODE_ENV: type.enumerated("dev", "prod").atLeastLength(3).default("dev"),
	TZ: type("string").atLeastLength(1),
});

const createConfig = () => ({
	BOT_TOKEN: env.BOT_TOKEN,
	TELEGRAPH_TOKEN: env.TELEGRAPH_TOKEN,
	SAUCENAO_TOKEN: env.SAUCENAO_TOKEN,
	DATABASE: {
		USER: env.POSTGRES_USER,
		PASSWORD: env.POSTGRES_PASSWORD,
		DATABASE: env.POSTGRES_DB,
		HOST: env.POSTGRES_HOST,
		PORT: env.POSTGRES_PORT,
		URL: env.DATABASE_URL,
	},
	NODE_ENV: env.NODE_ENV,
	TZ: env.TZ,
});

export default createConfig();
