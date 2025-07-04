import { Bot } from "grammy";

import { dickComposer, extraComposer, msdIncorporatedComposer, startComposer, userinfoComposer } from "../elements";
import {
	apiRoot,
	autoQuote,
	autoUserCaching,
	buttonLogging,
	commandLogging,
	createContextConstructor,
	type Context,
} from "../utils";
import { parseMode } from "../utils/parse-mode";
import { Database } from "./database";
import { Logger } from "./logger";

export const logger = new Logger();

const database = new Database(logger);
await database.connect();

export const client = new Bot<Context>(process.env.TOKEN, {
	ContextConstructor: createContextConstructor({ database, logger }),
	client: { apiRoot },
});

client.use(async (ctx, next) => commandLogging(ctx, next));
client.use(async (ctx, next) => buttonLogging(ctx, next));

client.use(autoQuote());
client.api.config.use(parseMode("HTML"));

client.use(async (ctx, next) => autoUserCaching(ctx, database, next));

client.use(dickComposer);
client.use(extraComposer);
client.use(msdIncorporatedComposer);
client.use(startComposer);
client.use(userinfoComposer);

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
