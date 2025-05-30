import { client, logger } from "./structures/client";
import { onStart } from "./utils";

client.start({
	onStart: info => onStart(logger, info),
	drop_pending_updates: true,
	allowed_updates: ["chat_member", "message", "message_reaction", "edited_message", "callback_query", "channel_post"],
});
