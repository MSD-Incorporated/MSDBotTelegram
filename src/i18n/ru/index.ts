import { boldAndTextLink, code, text_mention } from "../../utils/formatter";
import type { BaseTranslation } from "../i18n-types.js";

const ru = {
	// Start Composer
	start_command: [
		`Добро пожаловать!\n`,
		`• Текущая версия ${boldAndTextLink("MSDBot", "https://github.com/MSD-Incorporated/MSDBotTelegram")} — ${code("{version:string}")}`,
		`• Текущая версия ${boldAndTextLink("Bun", "https://bun.sh")} — ${code("v{bun_version:string}")}`,
	].join("\n"),
	start_refferal_command: [
		`Вы были успешно зарегистрированы по рефферальной ссылке!`,
		`• Ваш рефферал: ${text_mention("{refferal_name:string}", "{refferal_id:number}")} [${code("{refferal_id:number}")}]`,
	].join("\n\n"),
	// Userinfo Composer
	userinfo: [
		`Вот информация о ${text_mention("{fullname:string}", "{id:number}")}\n`,
		`• Telegram ID: ${code("{user_id:number}")}`,
		`• Имя: ${code("{first_name:string}")}`,
		`• Фамилия: ${code("{last_name:string}")}`,
		`• Никнейм: ${code("{username:string}")}\n`,
		`• MSDBot ID: ${code("{id:number}")}`,
		`• Присоединился к экосистеме MSD: ${code("{created_at:string}")}`,
		`• Роль: ${code("{status:string}")}`,
	].join("\n"),
	userinfo_refferal_button: `{emoji:string} Рефферальная ссылка`,
	userinfo_add_button: "{emoji:string} Добавить кнопку",
	userinfo_delete_button: "{emoji:string} Удалить кнопку",
} satisfies BaseTranslation;

export default ru;
