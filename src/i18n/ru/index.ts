import { bold, boldAndTextLink, code, text_mention } from "../../utils/formatter";
import type { BaseTranslation } from "../i18n-types.js";

const ru = {
	// Global
	keyboard_same_page: "Вы уже на этой странице",
	keyboard_wrong_user: "Эта кнопка предназначена не вам",
	keyboard_back_page: "Назад",
	keyboard_current_page: "{page:number}/{totalPages:number}",
	keyboard_next_page: "Вперёд",

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
	start_channel_button: "Информационный канал",
	// Dick Composer
	dick_timeout_text: [
		`Попробуйте через ${code("{timeLeft:string}")}`,
		`Ваш текущий размер pp: ${code("{size:number}")} см`,
	].join("\n"),
	dick_history_button: "История",
	dick_success_text: [`Ваш pp {phrase:string}`, `Ваш текущий размер pp: ${code("{current_size:number}")} см`].join(
		"\n\n"
	),
	dick_leaderboard_choose_text: [
		"{emoji:string} Выберите тип таблицы\n",
		`• По возрастанию — этот тип таблицы означает, что ${bold("сначала показываются пользователи с самым маленьким размером")}`,
		`${bold("Пример:")}`,
		`<blockquote class="tg-blockquote">${bold("1.")} Mased: ${code("-10")} см\n${bold("2.")} MSDBot: ${code("5")} см</blockquote>\n`,
		`• По убыванию — этот тип таблицы означает, что ${bold("сначала показываются пользователи с самым большим размером")}`,
		`${bold("Пример:")}`,
		`<blockquote class="tg-blockquote">${bold("1.")} MSDBot: ${code("5")} см\n${bold("2.")} Mased: ${code("-10")} см</blockquote>`,
	].join("\n"),
	dick_leaderboard_user: `${bold("{rank:number}.")} {name:string}: ${code("{size:number}")} см`,
	dick_leaderboard_ascending_button: "{emoji:string} По возрастанию",
	dick_leaderboard_descending_button: "{emoji:string} По убыванию",
	dick_leaderboard_empty: "Таблица лидеров пуста",
	dick_history_user: [
		`${bold("{rank:number}.")} ${code("{date:string} UTC")}`,
		`• Получено: ${code("{difference:number}")}`,
		`• Всего: ${code("{total:number}")}`,
	].join("\n"),
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
	userinfo_null_property: "Нету",
} satisfies BaseTranslation;

export default ru;
