import { Bot } from "grammy";

import { parseMode } from "@grammyjs/parse-mode";
import { autoQuote } from "../utils/auto-quote";
import { createContextConstructor, type Context } from "../utils/context";
import { Database } from "./database";

const database = new Database();
await database.connect();

export const client = new Bot<Context>(process.env.TOKEN, {
	ContextConstructor: createContextConstructor({ database }),
});

client.use(autoQuote());
client.api.config.use(parseMode("HTML"));

process.once("SIGINT", () => client.stop());
process.once("SIGTERM", () => client.stop());
