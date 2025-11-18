import database from "@msdbot/database";
import { env } from "@msdbot/env";
import { Bot } from "grammy";

import { extraComposer, startComposer } from "../elements";
import { autoQuote, createContextConstructor, parseMode, type Context } from "../utils";

export const client = new Bot<Context>(env.BOT_TOKEN, {
	ContextConstructor: createContextConstructor({ database: database["db"] }),
});

client.use(autoQuote());
client.api.config.use(parseMode("html"));

process.once("SIGINT", async () => {
	await client.stop();
	await database.close();
	process.exit();
});

process.once("SIGTERM", async () => {
	await client.stop();
	await database.close();
	process.exit();
});

client.use(extraComposer);
client.use(startComposer);
