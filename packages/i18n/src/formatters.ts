import type { FormattersInitializer } from "typesafe-i18n";
import type { Formatters, Locales } from "./i18n-types.js";

/**
 * Sanitizes text by escaping special HTML characters.
 *
 * @template {string | number} C - The type of the input text, either string or number.
 * @param {C} text - The text to sanitize.
 * @returns {string} The sanitized text.
 */
export const textSanitaizer = <C extends string | number>(text: C): string =>
	text
		.toString()
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");

/**
 * Wraps content in a blockquote tag.
 *
 * @template {string | number} C - The type of the input content, either string or number.
 * @param {C} content - The content to wrap.
 * @returns {`<blockquote class="tg-blockquote">${C}</blockquote>`} The content wrapped in a blockquote.
 */
export const blockquote = <C extends string | number, U extends boolean>(
	content: C,
	use_sanitizer: U = true as U
): `<blockquote class="tg-blockquote">${C}</blockquote>` => {
	return `<blockquote class="tg-blockquote">${use_sanitizer ? (textSanitaizer(content) as C) : content}</blockquote>`;
};

/**
 * Wraps content in a bold tag.
 *
 * @template {string | number} C - The type of the input content, either string or number.
 * @param {C} content - The content to wrap.
 * @returns {`<b class="tg-bold">${C}</b>`} The content wrapped in a bold tag.
 */
export const bold = <C extends string | number>(content: C): `<b class="tg-bold">${C}</b>` => {
	return `<b class="tg-bold">${textSanitaizer(content) as C}</b>`;
};

/**
 * Wraps content in a code tag.
 *
 * @template {string | number} C - The type of the input content, either string or number.
 * @param {C} content - The content to wrap.
 * @returns {`<code class="tg-code">${C}</code>`} The content wrapped in a code tag.
 */
export const code = <C extends string | number>(content: C): `<code class="tg-code">${C}</code>` => {
	return `<code class="tg-code">${textSanitaizer(content) as C}</code>`;
};

/**
 * Wraps content in pre and code tags, optionally specifying a language.
 *
 * @template {string | number} C - The type of the input content, either string or number.
 * @template {string} L - The type of the language string.
 * @param {C} content - The content to wrap.
 * @returns {`<pre class="tg-pre-code"><code>${C}</code></pre>` | `<pre class="tg-pre-code"><code class="language-${L}">${C}</code></pre>`} The content wrapped in pre and code tags.
 */
export function pre<C extends string | number>(content: C): `<pre class="tg-pre-code"><code>${C}</code></pre>`;

/**
 * Wraps content in pre and code tags, optionally specifying a language.
 *
 * @template {string | number} C - The type of the input content, either string or number.
 * @template {string} L - The type of the language string.
 * @param {C} content - The content to wrap.
 * @param {L} [language] - Optional language for the code.
 * @returns {`<pre class="tg-pre-code"><code>${C}</code></pre>` | `<pre class="tg-pre-code"><code class="language-${L}">${C}</code></pre>`} The content wrapped in pre and code tags.
 */
export function pre<C extends string | number, L extends string>(
	content: C,
	language: L
): `<pre class="tg-pre-code"><code class="language-${L}">${C}</code></pre>`;

export function pre(content: string, language?: string) {
	return language === undefined
		? `<pre class="tg-pre-code"><code>${textSanitaizer(content)}</code></pre>`
		: `<pre class="tg-pre-code"><code class="language-${language}">${textSanitaizer(content)}</code></pre>`;
}

/**
 * Creates an anchor tag with a text link.
 *
 * @template {string | number} C - The type of the link text, either string or number.
 * @template {string} U - The type of the URL string.
 * @param {C} text - The link text.
 * @param {U} url - The URL for the link.
 * @returns {`<a class="tg-text-link" href="${U}">${C}</a>`} The anchor tag with the text link.
 */
export const text_link = <C extends string | number, U extends string>(
	text: C,
	url: U
): `<a class="tg-text-link" href="${U}">${C}</a>` =>
	`<a class="tg-text-link" href="${url}">${textSanitaizer(text) as C}</a>`;

/**
 * Creates a bold anchor tag with a text link.
 *
 * @template {string | number} C - The type of the link text, either string or number.
 * @template {string} U - The type of the URL string.
 * @param {C} text - The link text.
 * @param {U} url - The URL for the link.
 * @returns {`<b class="tg-bold"><a class="tg-text-link" href="${U}">${C}</a></b>`} The bold anchor tag with the text link.
 */
export const boldAndTextLink = <C extends string | number, U extends string>(
	text: C,
	url: U
): `<b class="tg-bold"><a class="tg-text-link" href="${U}">${C}</a></b>` =>
	`<b class="tg-bold"><a class="tg-text-link" href="${url}">${textSanitaizer(text) as C}</a></b>`;

/**
 * Creates an anchor tag for a text mention with a user ID.
 *
 * @template {string | number} C - The type of the name to mention, either string or number.
 * @template {string} U - The type of the user ID.
 * @param {C} name - The name to mention.
 * @param {U} id - The ID of the user.
 * @returns {`<a class="tg-text-mention" href="tg://user?id=${U}">${C}</a>`} The anchor tag for the text mention.
 */
export const text_mention = <C extends string | number, U extends string>(
	name: C,
	id: U
): `<a class="tg-text-mention" href="tg://user?id=${U}">${C}</a>` =>
	`<a class="tg-text-mention" href="tg://user?id=${id}">${textSanitaizer(name) as C}</a>`;

/**
 * Creates a premium emoji tag.
 *
 * @template {string} E - The type of the emoji string.
 * @template {string | number} I - The type of the emoji ID, either string or number.
 * @param {E} emoji - The emoji character.
 * @param {I} id - The ID of the premium emoji.
 * @returns {`<tg-emoji emoji-id="${I}">${E}</tg-premium-emoji>`} The premium emoji tag.
 *
 * @example <tg-emoji emoji-id="5368324170671202286">👍</tg-emoji>
 */
export const premium_emoji = <E extends string, I extends string | number>(
	emoji: E,
	id: I
): `<tg-emoji emoji-id="${I}">${E}</tg-premium-emoji>` => {
	return `<tg-emoji emoji-id="${id}">${emoji}</tg-premium-emoji>`;
};

export const initFormatters: FormattersInitializer<Locales, Formatters> = (_locale: Locales) => {
	const formatters: Formatters = {};

	return formatters;
};
