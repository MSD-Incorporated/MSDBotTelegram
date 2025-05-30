import { parseMode } from "@grammyjs/parse-mode";
import { Bot } from "grammy";

import { dickComposer, extraComposer, msdIncorporatedComposer, startComposer } from "../elements";
import { autoQuote, autoUserCaching, commandLogging, createContextConstructor, type Context } from "../utils";
import { Database } from "./database";
import { Logger } from "./logger";

export const logger = new Logger();

const database = new Database(logger);
await database.connect();

export const client = new Bot<Context>(process.env.TOKEN, {
	ContextConstructor: createContextConstructor({ database, logger }),
	client: { apiRoot: process.env.LOCAL_API ?? "https://api.telegram.org" },
});

client.use(autoQuote());
client.api.config.use(parseMode("HTML"));

client.use(async (ctx, next) => autoUserCaching(ctx, database, next));
client.use(async (ctx, next) => commandLogging(ctx, next));

client.use(dickComposer);
client.use(extraComposer);
client.use(msdIncorporatedComposer);
client.use(startComposer);

process.once("SIGINT", async () => {
	logger.custom(logger.ck.red("SIGINT received, shutting down..."));

	await client.stop();
	await database.close();
});
process.once("SIGTERM", async () => {
	logger.custom(logger.ck.red("SIGTERM received, shutting down..."));

	await client.stop();
	await database.close();
});
