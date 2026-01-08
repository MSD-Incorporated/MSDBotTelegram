import database from "@msdbot/database";
import env from "@msdbot/env";
import { Bot } from "grammy";

import { dickComposer, extraComposer, startComposer } from "../elements";
import { BackupElement } from "../elements/backup.element";
import { MSDIncComposer } from "../elements/msdinc.composer";
import { autoQuote, createContextConstructor, parseMode, type Context } from "../utils";

export const client = new Bot<Context>(env.BOT_TOKEN, {
	ContextConstructor: createContextConstructor({ database: database }),
	client: {
		apiRoot: env.NODE_ENV === "prod" ? (env.LOCAL_API !== undefined ? env.LOCAL_API : undefined) : undefined,
	},
});

client.use(autoQuote());
client.api.config.use(parseMode("html"));

process.once("SIGINT", async () => {
	await client.stop();
	await database.close();
	process.exit();
});

process.once("SIGTERM", async () => {
	await client.stop();
	await database.close();
	process.exit();
});

const backupElement = new BackupElement(client);
client.use(backupElement.composer);
backupElement.startCron();

client.use(dickComposer);
client.use(extraComposer);
client.use(startComposer);
client.use(MSDIncComposer);
