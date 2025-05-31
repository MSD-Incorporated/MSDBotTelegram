import type { ParseModeFlavor } from "@grammyjs/parse-mode";
import { type Api, Context as DefaultContext } from "grammy";
import type { Update, UserFromGetMe } from "grammy/types";
import L from "../i18n/i18n-node";
import type { Locales, TranslationFunctions } from "../i18n/i18n-types";
import { locales } from "../i18n/i18n-util";
import type { Database } from "../structures/database";
import type { Logger } from "../structures/logger";

interface ExtendedContextFlavor {
	database: Database;
	logger: Logger;
	t: TranslationFunctions;
}

interface Dependencies {
	database: Database;
	logger: Logger;
}

export type Context = ParseModeFlavor<DefaultContext & ExtendedContextFlavor>;

export function createContextConstructor({ database, logger }: Dependencies) {
	return class extends DefaultContext implements ExtendedContextFlavor {
		database: Database;
		logger: Logger;
		t: TranslationFunctions;

		constructor(update: Update, api: Api, me: UserFromGetMe) {
			super(update, api, me);

			this.database = database;
			this.logger = logger;
			this.t = locales.includes(this.update.message?.from?.language_code as Locales)
				? L[this.update.message?.from?.language_code as Locales]
				: L["ru"];
		}
	} as unknown as new (update: Update, api: Api, me: UserFromGetMe) => Context;
}
