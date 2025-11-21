import type { Database } from "@msdbot/database";
import { L, type Locales, type TranslationFunctions, isLocale } from "@msdbot/i18n";
import { type Api, Context as DefaultContext } from "grammy";
import type { Update, UserFromGetMe } from "grammy/types";

import { normalizeName } from "./little-utils";

interface ExtendedContextFlavor {
	database: Omit<Database, "client" | "close" | "connect">;
	t: TranslationFunctions;
	normalized_name: string;
}

interface Dependencies {
	database: Database;
}

export type Context = DefaultContext & ExtendedContextFlavor;

export function createContextConstructor({ database }: Dependencies) {
	return class extends DefaultContext implements ExtendedContextFlavor {
		database: Database;
		t: TranslationFunctions;
		normalized_name: string;

		constructor(update: Update, api: Api, me: UserFromGetMe) {
			super(update, api, me);

			const from = this.update.message!.from;
			const locale = from.language_code;
			const normalized_name = normalizeName(from);

			this.database = database;
			this.normalized_name = normalized_name;
			this.t = locale && isLocale(locale as Locales) ? L[locale as Locales] : L["ru"];
		}
	} as unknown as new (update: Update, api: Api, me: UserFromGetMe) => Context;
}
