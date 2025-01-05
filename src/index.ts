import { client, onStart } from "./structures/client";

client.start({ onStart, drop_pending_updates: true });
