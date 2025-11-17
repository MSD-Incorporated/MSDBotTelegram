import { env } from "@msdbot/env";
import { Bot } from "grammy";

import { startComposer } from "../elements/start.composer";
import { autoQuote, createContextConstructor, parseMode, type Context } from "../utils";

export const client = new Bot<Context>(env.BOT_TOKEN, {
	ContextConstructor: createContextConstructor({}),
});

client.use(autoQuote());
client.api.config.use(parseMode("html"));

process.once("SIGINT", async () => client.stop());
process.once("SIGTERM", async () => client.stop());

client.use(startComposer);
