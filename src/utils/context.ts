import type { ParseModeFlavor } from "@grammyjs/parse-mode";
import { type Api, Context as DefaultContext } from "grammy";
import type { Update, UserFromGetMe } from "grammy/types";
import L from "i18n/i18n-node";
import type { Locales, TranslationFunctions } from "i18n/i18n-types";
import { Database } from "../structures/database";

interface ExtendedContextFlavor {
	database: Database;
	t: TranslationFunctions;
}

interface Dependencies {
	database: Database;
}

export type Context = ParseModeFlavor<DefaultContext & ExtendedContextFlavor>;

export function createContextConstructor({ database }: Dependencies) {
	return class extends DefaultContext implements ExtendedContextFlavor {
		database: Database;
		t: TranslationFunctions;

		constructor(update: Update, api: Api, me: UserFromGetMe) {
			super(update, api, me);

			this.database = database;
			this.t = L[(this.update.message?.from?.language_code ?? "ru") as Locales];
		}
	} as unknown as new (update: Update, api: Api, me: UserFromGetMe) => Context;
}
