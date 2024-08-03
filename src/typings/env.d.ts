declare type ConfigKey = "TOKEN" | "TELEGRAPH_TOKEN" | "SAUCENAO_TOKEN";

declare type EnvKeys = {
	[key in ConfigKey]: string;
};

declare namespace NodeJS {
	interface ProcessEnv extends EnvKeys {}
}
