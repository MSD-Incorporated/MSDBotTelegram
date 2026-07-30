import {
  BUN_URL,
  DEVELOPER,
  INFOMRATION_CHANNEL,
  MSDBOT_URL,
  NODEJS_URL,
} from "../constants";
import {
  blockquote,
  bold,
  boldAndTextLink,
  code,
  premium_emoji,
} from "../formatters";
import type { BaseTranslation } from "../i18n-types";

const dick_history_types = {
  dick: "Команда /dick",
  dice: "Казино",
  referral: "Рефералы",
  transfer: "Переводы",
};

const ru = {
  dick_history_types,

  keyboard_same_page: "Вы уже на этой странице",
  keyboard_wrong_user: "Эта кнопка предназначена не вам",
  keyboard_back_page: "‹ Назад",
  keyboard_current_page: "{page:number}/{totalPages:number}",
  keyboard_next_page: "Вперёд ›",

  start_command: [
    `${premium_emoji("👋", "5472055112702629499") + bold(" Добро пожаловать!")}\n`,
    `• ${bold(`Версия`)} ${boldAndTextLink("MSDBot", MSDBOT_URL)} — ${code("v{msdbot_version:string}")} [${code("{commit:string}")}]`,
    `• ${bold("Версия")} ${boldAndTextLink("NodeJS", NODEJS_URL)} — ${code("{version:string}")}`,
    `• ${bold("Версия")} ${boldAndTextLink("Bun", BUN_URL)} — ${code("v{bun_version:string}")}\n`,
    [
      premium_emoji("🧑‍💻", "5190458330719461749") +
        boldAndTextLink(` Разработчик`, DEVELOPER, false),
      premium_emoji("📰", "5433982607035474385") +
        boldAndTextLink(` Канал`, INFOMRATION_CHANNEL, false),
    ].join("丨"),
  ].join("\n"),

  start_referral_command: [
    premium_emoji("👋", "5472055112702629499") + bold(` Добро пожаловать!`),
    bold(`Вы успешно зарегистрировались по реферальной ссылке.\n`),
    `${bold(`👤 Ваш реферер:`)} ${boldAndTextLink("{referrer_name:string}", "tg://openmessage?user_id={referrer_id:number}")} [${code("{referrer_id:number}")}]`,
  ].join("\n"),

  im_here: [
    premium_emoji("👋", "5472055112702629499") + bold(" Я тут!\n"),
    blockquote(bold("❓ Не можете разобраться?"), false),
    [
      bold("Просто напишите"),
      code("/"),
      bold("после чего, вы получите список имеющихся у меня команд!"),
    ].join(" "),
  ].join("\n"),

  dick_increased:
    bold(`увеличился на `) + `${code("{difference:string}")}` + bold(` см!`),
  dick_decreased:
    bold(`уменьшился на `) + `${code("{difference:string}")}` + bold(` см!`),
  dick_not_changed:
    premium_emoji("😔", "5370781385885751708") + bold(` не изменился!`, false),

  dick_timeout_text: [
    bold(`Попробуйте ещё через `) + `${code("{timeLeft:string}")}\n`,
    premium_emoji("✨", "5325547803936572038") +
      bold(` Ваш текущий размер pp: `, false) +
      `${code("{size:number}")}` +
      bold(` см`),
  ].join("\n"),

  dick_history_button: "История",
  dick_history_empty: "История использования пуста",

  dick_success_text: [
    bold(`{emoji:string} Ваш pp `, false) + `{phrase:string}`,
    bold(`Ваш текущий размер pp: `) + code("{current_size:number}") + ` см`,
  ].join("\n\n"),

  dick_leaderboard_choose_text: [
    bold("{emoji:string} Выберите тип таблицы\n", false),
    `${premium_emoji("📈", "5244837092042750681")} По возрастанию — этот тип таблицы означает, что ${bold("сначала показываются пользователи с самым маленьким размером")}\n`,
    `${bold("Пример:")}`,
    `<blockquote class="tg-blockquote">${bold("1.")} Mased: ${code("-10")} см\n${bold("2.")} MSDBot: ${code("5")} см</blockquote>\n`,
    `${premium_emoji("📉", "5246762912428603768")} По убыванию — этот тип таблицы означает, что ${bold("сначала показываются пользователи с самым большим размером")}\n`,
    `${bold("Пример:")}`,
    `<blockquote class="tg-blockquote">${bold("1.")} MSDBot: ${code("5")} см\n${bold("2.")} Mased: ${code("-10")} см</blockquote>`,
  ].join("\n"),
  dick_leaderboard_user: `${bold("{rank:number}.")} {name:string}: ${code("{size:number}")} см`,
  dick_leaderboard_ascending_button: "По возрастанию",
  dick_leaderboard_descending_button: "По убыванию",
  dick_leaderboard_empty: "Таблица лидеров пуста",
  dick_history_user: [
    `${bold("{rank:number}.")} <tg-time unix="{date:number}" format="r">{date:number|formatDate}</tg-time> [${code("{date:number|formatDate}")}]`,
    `• ${bold("Получено:")} ${code("{difference:number}")}`,
    `• ${bold("Всего:")} ${code("{total:number}")}`,
    `• ${bold("Тип:")} ${code("{type:string}")}`,
  ].join("\n"),
  dick_refferal_text: [
    "Наша реферальная система позволяет получать дополнительные сантиметры к dick",
    `Однако только в том случае, если вы пригласили участника или подписались на ${boldAndTextLink("канал", "https://t.me/msdbot_information")}!\n`,
    `За каждого приглашённого участника, который запустит бота по вашей реферальной ссылке и использует /dick вы получаете ${code(`1`)} см`,
    `Также, если вы подписались на наш ${boldAndTextLink("информационный канал", "https://t.me/msdbot_information")}, то вы тоже получаете ${code(`1`)} см`,
    `Все эти сантиметры суммируются и затем, раз в ${code(`72`)} часа, вы можете прибавить или отнять их у себя!\n`,

    `• Количество рефералов: ${code(`{referrals_count:number}`)}`,
    `• Количество ${bold("активных")} рефералов: ${code(`{active_referrals_count:number}`)}`,
    `• Подписаны на канал: ${code("{isSubscribed:string}")}`,
    `• {canGet:string}`,
  ].join("\n"),
  dick_referral_timeout_text: [
    bold(`Попробуйте через `) + code("{timeLeft:string}") + "\n",
    bold(
      `${premium_emoji("👥", "5372926953978341366")} На данный момент вы имеете ${code("{referrals:number}")} активных {{рефералов|реферал|реферала|реферала|рефералов}}.`,
      false,
    ),
    bold(
      `${premium_emoji("🗳️", "5359741159566484212")} Подписаны ли на ${boldAndTextLink("канал", "https://t.me/msdbot_information")}: `,
      false,
    ) + code("{isSubscribed:string}"),
  ].join("\n"),
  dick_referral_success:
    bold(`Вы успешно {type:string} ваш dick на `) +
    code(`{value:number}`) +
    bold(` см!`),
} satisfies BaseTranslation;

export default ru;
