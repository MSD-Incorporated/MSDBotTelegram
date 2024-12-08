import { bold, code } from "../../utils/formatter";
import type { BaseTranslation } from "../i18n-types.js";

const ru = {
	hi: `Привет, ${bold("мир")}, это ${code(`{username:string}`)}`,
} satisfies BaseTranslation;

export default ru;
