import { parseMode } from "@grammyjs/parse-mode";
import { Bot } from "grammy";

import { dickComposer, extraComposer, startComposer } from "../elements";
import { autoQuote, autoUserCaching, createContextConstructor, type Context } from "../utils";
import { Database } from "./database";

const database = new Database();
await database.connect();

export const client = new Bot<Context>(process.env.TOKEN, {
	ContextConstructor: createContextConstructor({ database }),
	client: { apiRoot: process.env.LOCAL_API ? process.env.LOCAL_API : "https://api.telegram.org" },
});

client.use(autoQuote());
client.api.config.use(parseMode("HTML"));

client.use(async (ctx, next) => autoUserCaching(ctx, database, next));

client.use(dickComposer);
client.use(extraComposer);
client.use(startComposer);

process.once("SIGINT", () => client.stop());
process.once("SIGTERM", () => client.stop());
