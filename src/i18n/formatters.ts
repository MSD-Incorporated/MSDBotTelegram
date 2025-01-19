import type { FormattersInitializer } from "typesafe-i18n";
import type { Formatters, Locales } from "./i18n-types.js";

export const roles = {
	owner: "Создатель",
	trusted: "Доверенный",
	user: "Пользователь",
};

export const initFormatters: FormattersInitializer<Locales, Formatters> = (_locale: Locales) => {
	const formatters: Formatters = {};

	return formatters;
};
