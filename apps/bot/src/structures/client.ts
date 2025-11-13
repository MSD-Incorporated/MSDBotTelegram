import { env } from "@msdbot/env";
import { Bot } from "grammy";
import { autoQuote, createContextConstructor, onStart, parseMode, type Context } from "../utils";

export const client = new Bot<Context>(env.BOT_TOKEN, {
	ContextConstructor: createContextConstructor({}),
});

client.use(autoQuote());
client.api.config.use(parseMode("html"));

client.start({ onStart, allowed_updates: ["message", "callback_query"], drop_pending_updates: true });
