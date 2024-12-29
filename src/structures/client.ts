import { parseMode } from "@grammyjs/parse-mode";
import { autoQuote } from "@roziscoding/grammy-autoquote";
import { Bot } from "grammy";
import { createContextConstructor, type Context } from "../utils";
import { Database } from "./database";

export const client = new Bot<Context>(process.env.TOKEN, {
	ContextConstructor: createContextConstructor({ database: new Database() }),
});

process.once("SIGINT", () => client.stop());
process.once("SIGTERM", () => client.stop());

client.use(autoQuote());
client.api.config.use(parseMode("HTML"));

client.catch(console.error);
client.init();
