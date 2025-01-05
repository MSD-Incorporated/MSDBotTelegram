import { bold, boldAndTextLink, code, text_link, text_mention } from "../../utils/formatter";
import type { BaseTranslation } from "../i18n-types.js";

const ru = {
	start_command: [
		`Добро пожаловать!\n`,
		`• Текущая версия ${boldAndTextLink("MSDBot", "https://github.com/MSD-Incorporated/MSDBotTelegram")} — ${code("{version:string}")}`,
		`• Текущая версия ${boldAndTextLink("Bun", "https://bun.sh")} — ${code("v{bun_version:string}")}`,
	].join("\n"),
	start_refferal_command: [
		`Вы были успешно зарегистрированы по рефферальной ссылке!`,
		`• Ваш рефферал: ${text_mention("{refferal_name:string}", "{refferal_id:string}")} [${code("{refferal_id:string}")}]`,
	].join("\n\n"),
} satisfies BaseTranslation;

export default ru;
