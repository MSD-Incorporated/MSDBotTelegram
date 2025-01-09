// This file was auto-generated by 'typesafe-i18n'. Any manual changes will be overwritten.
/* eslint-disable */
import type { BaseTranslation as BaseTranslationType, LocalizedString, RequiredParams } from 'typesafe-i18n'

export type BaseTranslation = BaseTranslationType
export type BaseLocale = 'ru'

export type Locales =
	| 'ru'

export type Translation = RootTranslation

export type Translations = RootTranslation

type RootTranslation = {
	/**
	 * Д​о​б​р​о​ ​п​о​ж​а​л​о​в​а​т​ь​!​
​
​•​ ​Т​е​к​у​щ​а​я​ ​в​е​р​с​и​я​ ​<​b​ ​c​l​a​s​s​=​"​t​g​-​b​o​l​d​"​>​<​a​ ​c​l​a​s​s​=​"​t​g​-​t​e​x​t​-​l​i​n​k​"​ ​h​r​e​f​=​"​h​t​t​p​s​:​/​/​g​i​t​h​u​b​.​c​o​m​/​M​S​D​-​I​n​c​o​r​p​o​r​a​t​e​d​/​M​S​D​B​o​t​T​e​l​e​g​r​a​m​"​>​M​S​D​B​o​t​<​/​a​>​<​/​b​>​ ​—​ ​<​c​o​d​e​ ​c​l​a​s​s​=​"​t​g​-​c​o​d​e​"​>​{​v​e​r​s​i​o​n​}​<​/​c​o​d​e​>​
​•​ ​Т​е​к​у​щ​а​я​ ​в​е​р​с​и​я​ ​<​b​ ​c​l​a​s​s​=​"​t​g​-​b​o​l​d​"​>​<​a​ ​c​l​a​s​s​=​"​t​g​-​t​e​x​t​-​l​i​n​k​"​ ​h​r​e​f​=​"​h​t​t​p​s​:​/​/​b​u​n​.​s​h​"​>​B​u​n​<​/​a​>​<​/​b​>​ ​—​ ​<​c​o​d​e​ ​c​l​a​s​s​=​"​t​g​-​c​o​d​e​"​>​v​{​b​u​n​_​v​e​r​s​i​o​n​}​<​/​c​o​d​e​>
	 * @param {string} bun_version
	 * @param {string} version
	 */
	start_command: RequiredParams<'bun_version' | 'version'>
	/**
	 * В​ы​ ​б​ы​л​и​ ​у​с​п​е​ш​н​о​ ​з​а​р​е​г​и​с​т​р​и​р​о​в​а​н​ы​ ​п​о​ ​р​е​ф​ф​е​р​а​л​ь​н​о​й​ ​с​с​ы​л​к​е​!​
​
​•​ ​В​а​ш​ ​р​е​ф​ф​е​р​а​л​:​ ​<​a​ ​c​l​a​s​s​=​"​t​g​-​t​e​x​t​-​m​e​n​t​i​o​n​"​ ​h​r​e​f​=​"​t​g​:​/​/​u​s​e​r​?​i​d​=​{​r​e​f​f​e​r​a​l​_​i​d​}​"​>​{​r​e​f​f​e​r​a​l​_​n​a​m​e​}​<​/​a​>​ ​[​<​c​o​d​e​ ​c​l​a​s​s​=​"​t​g​-​c​o​d​e​"​>​{​r​e​f​f​e​r​a​l​_​i​d​}​<​/​c​o​d​e​>​]
	 * @param {number} refferal_id
	 * @param {string} refferal_name
	 */
	start_refferal_command: RequiredParams<'refferal_id' | 'refferal_id' | 'refferal_name'>
	/**
	 * В​о​т​ ​и​н​ф​о​р​м​а​ц​и​я​ ​о​ ​<​a​ ​c​l​a​s​s​=​"​t​g​-​t​e​x​t​-​m​e​n​t​i​o​n​"​ ​h​r​e​f​=​"​t​g​:​/​/​u​s​e​r​?​i​d​=​{​i​d​}​"​>​{​f​u​l​l​n​a​m​e​}​<​/​a​>​
​
​•​ ​T​e​l​e​g​r​a​m​ ​I​D​:​ ​<​c​o​d​e​ ​c​l​a​s​s​=​"​t​g​-​c​o​d​e​"​>​{​u​s​e​r​_​i​d​}​<​/​c​o​d​e​>​
​•​ ​И​м​я​:​ ​<​c​o​d​e​ ​c​l​a​s​s​=​"​t​g​-​c​o​d​e​"​>​{​f​i​r​s​t​_​n​a​m​e​}​<​/​c​o​d​e​>​
​•​ ​Ф​а​м​и​л​и​я​:​ ​<​c​o​d​e​ ​c​l​a​s​s​=​"​t​g​-​c​o​d​e​"​>​{​l​a​s​t​_​n​a​m​e​}​<​/​c​o​d​e​>​
​•​ ​Н​и​к​н​е​й​м​:​ ​<​c​o​d​e​ ​c​l​a​s​s​=​"​t​g​-​c​o​d​e​"​>​{​u​s​e​r​n​a​m​e​}​<​/​c​o​d​e​>​
​
​•​ ​M​S​D​B​o​t​ ​I​D​:​ ​<​c​o​d​e​ ​c​l​a​s​s​=​"​t​g​-​c​o​d​e​"​>​{​i​d​}​<​/​c​o​d​e​>​
​•​ ​П​р​и​с​о​е​д​и​н​и​л​с​я​ ​к​ ​э​к​о​с​и​с​т​е​м​е​ ​M​S​D​:​ ​<​c​o​d​e​ ​c​l​a​s​s​=​"​t​g​-​c​o​d​e​"​>​{​c​r​e​a​t​e​d​_​a​t​}​<​/​c​o​d​e​>​
​•​ ​Р​о​л​ь​:​ ​<​c​o​d​e​ ​c​l​a​s​s​=​"​t​g​-​c​o​d​e​"​>​{​s​t​a​t​u​s​}​<​/​c​o​d​e​>
	 * @param {string} created_at
	 * @param {string} first_name
	 * @param {string} fullname
	 * @param {number} id
	 * @param {string} last_name
	 * @param {string} status
	 * @param {number} user_id
	 * @param {string} username
	 */
	userinfo: RequiredParams<'created_at' | 'first_name' | 'fullname' | 'id' | 'id' | 'last_name' | 'status' | 'user_id' | 'username'>
	/**
	 * {​e​m​o​j​i​}​ ​•​ ​Р​е​ф​ф​е​р​а​л​ь​н​а​я​ ​с​с​ы​л​к​а
	 * @param {string} emoji
	 */
	userinfo_refferal_button: RequiredParams<'emoji'>
}

export type TranslationFunctions = {
	/**
	 * Добро пожаловать!

• Текущая версия <b class="tg-bold"><a class="tg-text-link" href="https://github.com/MSD-Incorporated/MSDBotTelegram">MSDBot</a></b> — <code class="tg-code">{version}</code>
• Текущая версия <b class="tg-bold"><a class="tg-text-link" href="https://bun.sh">Bun</a></b> — <code class="tg-code">v{bun_version}</code>
	 */
	start_command: (arg: { bun_version: string, version: string }) => LocalizedString
	/**
	 * Вы были успешно зарегистрированы по рефферальной ссылке!

• Ваш рефферал: <a class="tg-text-mention" href="tg://user?id={refferal_id}">{refferal_name}</a> [<code class="tg-code">{refferal_id}</code>]
	 */
	start_refferal_command: (arg: { refferal_id: number, refferal_name: string }) => LocalizedString
	/**
	 * Вот информация о <a class="tg-text-mention" href="tg://user?id={id}">{fullname}</a>

• Telegram ID: <code class="tg-code">{user_id}</code>
• Имя: <code class="tg-code">{first_name}</code>
• Фамилия: <code class="tg-code">{last_name}</code>
• Никнейм: <code class="tg-code">{username}</code>

• MSDBot ID: <code class="tg-code">{id}</code>
• Присоединился к экосистеме MSD: <code class="tg-code">{created_at}</code>
• Роль: <code class="tg-code">{status}</code>
	 */
	userinfo: (arg: { created_at: string, first_name: string, fullname: string, id: number, last_name: string, status: string, user_id: number, username: string }) => LocalizedString
	/**
	 * {emoji} • Рефферальная ссылка
	 */
	userinfo_refferal_button: (arg: { emoji: string }) => LocalizedString
}

export type Formatters = {}
