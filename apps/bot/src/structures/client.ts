import { env } from "@msdbot/env";
import { Bot } from "grammy";
import type { UserFromGetMe } from "grammy/types";

export const client = new Bot(env.BOT_TOKEN, {});

export const onStart = ({ id, username, first_name }: UserFromGetMe) =>
	console.log(`${first_name} | @${username} [${id}] started!`);

client.start({
	onStart,
	allowed_updates: ["message", "callback_query"],
});
