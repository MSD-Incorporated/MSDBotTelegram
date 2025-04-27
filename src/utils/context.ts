import type { ParseModeFlavor } from "@grammyjs/parse-mode";
import { type Api, Context as DefaultContext } from "grammy";
import type { Update, UserFromGetMe } from "grammy/types";
import type { Database } from "../structures/database";

interface ExtendedContextFlavor {
	database: Database;
}

interface Dependencies {
	database: Database;
}

export type Context = ParseModeFlavor<DefaultContext & ExtendedContextFlavor>;

export function createContextConstructor({ database }: Dependencies) {
	return class extends DefaultContext implements ExtendedContextFlavor {
		database: Database;

		constructor(update: Update, api: Api, me: UserFromGetMe) {
			super(update, api, me);

			this.database = database;
		}
	} as unknown as new (update: Update, api: Api, me: UserFromGetMe) => Context;
}
