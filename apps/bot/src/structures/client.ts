import { env } from "@msdbot/env";
import { onStart } from "@msdbot/utils";
import { Bot } from "grammy";

export const client = new Bot(env.BOT_TOKEN, {});

client.start({ onStart, allowed_updates: ["message", "callback_query"], drop_pending_updates: true });
