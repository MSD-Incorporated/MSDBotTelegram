import { parseMode } from "@grammyjs/parse-mode";
import { autoQuote } from "@roziscoding/grammy-autoquote";
import { Bot, GrammyError, HttpError } from "grammy";
import type { UserFromGetMe } from "typegram";
import {
	dickComposer,
	extraComposer,
	infoComposer,
	msdIncorporatedComposer,
	shitpostsComposer,
	startComposer,
} from "../elements";
import {
	autoChatCaching,
	autoChatMemberCaching,
	autoChatMemberDeletion,
	autoUserCaching,
	createContextConstructor,
	type Context,
} from "../utils";
import { Database } from "./database";

const database = new Database();
await database.connect();

export const client = new Bot<Context>(process.env.TOKEN, {
	ContextConstructor: createContextConstructor({ database }),
});

export const onStart = ({ username, id }: UserFromGetMe) => console.log(`${username} [${id}] started`);

process.once("SIGINT", () => client.stop());
process.once("SIGTERM", () => client.stop());

client.use(autoQuote());
client.use(async (ctx, next) => autoUserCaching(ctx, database, next));
client.use(async (ctx, next) => autoChatCaching(ctx, database, next));
client.use(async (ctx, next) => autoChatMemberCaching(ctx, database, next));
client.on("chat_member", async (ctx, next) => autoChatMemberDeletion(ctx, database, next));

client.api.config.use(parseMode("HTML"));

client.use(dickComposer);
client.use(extraComposer);
client.use(infoComposer);
client.use(msdIncorporatedComposer);
client.use(shitpostsComposer);
client.use(startComposer);

client.catch(err => {
	const ctx = err.ctx;
	console.error(`Error while handling update ${ctx.update.update_id}:`);
	const e = err.error;
	if (e instanceof GrammyError) {
		console.error("Error in request:", e.description);
	} else if (e instanceof HttpError) {
		console.error("Could not contact Telegram:", e);
	} else {
		console.error("Unknown error:", e);
	}
});

client.init();
