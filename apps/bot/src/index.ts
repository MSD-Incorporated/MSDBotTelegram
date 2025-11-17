import { client } from "./structures/client";
import { onStart } from "./utils";

client.start({ onStart, allowed_updates: ["message", "callback_query"], drop_pending_updates: true });
