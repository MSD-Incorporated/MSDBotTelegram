import { client, onStart } from "./structures/client";

const allowed_updates = [
	"message",
	"message_reaction",
	"edited_message",
	"callback_query",
	"channel_post",
	"chat_member",
] as const;

client.start({ onStart, drop_pending_updates: true, allowed_updates });
