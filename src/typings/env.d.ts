declare type ConfigKey = "TOKEN" | "TELEGRAPH" | "GOOGLE_AI_KEY";

declare type EnvKeys = {
	[key in ConfigKey]: string;
};

declare namespace NodeJS {
	interface ProcessEnv extends EnvKeys {}
}
