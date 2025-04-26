declare type ConfigKey =
	| "TOKEN"
	| "TELEGRAPH_TOKEN"
	| "SAUCENAO_TOKEN"
	| "POSTGRES_HOST"
	| "POSTGRES_PORT"
	| "POSTGRES_USER"
	| "POSTGRES_PASSWORD"
	| "POSTGRES_DB"
	| "DATABASE_URL";

declare type EnvKeys = {
	[key in ConfigKey]: string;
};

declare namespace NodeJS {
	interface ProcessEnv extends EnvKeys {}
}
