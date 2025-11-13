import type { UserFromGetMe } from "grammy/types";

export const onStart = ({ id, username, first_name }: UserFromGetMe) =>
	console.log(`${first_name} | @${username} [${id}] started!`);

export * from "./auto-quote";
export * from "./context";
export * from "./parse-mode";
