import arkenv, { type } from "arkenv";

export const env = arkenv({
	BOT_TOKEN: type("string")
		.configure({ examples: ["123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"] })
		.atLeastLength(1),
	LOCAL_API: type("string.url")
		.configure({ examples: ["http://telegram-bot-api:8081"] })
		.atLeastLength(1),

	POSTGRES_USER: type("string").atLeastLength(1),
	POSTGRES_PASSWORD: type("string").atLeastLength(1),
	POSTGRES_DB: type("string").atLeastLength(1),
	POSTGRES_HOST: type("string").atLeastLength(1),
	POSTGRES_PORT: type("number.port"),

	NODE_ENV: type.enumerated("dev", "prod").atLeastLength(3).default("dev"),
	TZ: type("string").atLeastLength(1),
});

const createConfig = () => ({
	BOT_TOKEN: env.BOT_TOKEN,
	DATABASE: {
		USER: env.POSTGRES_USER,
		PASSWORD: env.POSTGRES_PASSWORD,
		DATABASE: env.POSTGRES_DB,
		HOST: env.POSTGRES_HOST,
		PORT: env.POSTGRES_PORT,
		URL: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
	},
	NODE_ENV: env.NODE_ENV,
	TZ: env.TZ,
});

export default createConfig();
