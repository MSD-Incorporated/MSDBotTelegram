export const textSanitaizer = <C extends string>(text: C) =>
	text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");

export const blockqoute = <C extends string>(content: C): `<blockquote class="tg-blockquote">${C}</blockquote>` => {
	return `<blockquote class="tg-blockquote">${textSanitaizer(content) as C}</blockquote>`;
};

export const bold = <C extends string>(content: C): `<b class="tg-bold">${C}</b>` => {
	return `<b class="tg-bold">${textSanitaizer(content) as C}</b>`;
};

export const code = <C extends string>(content: C): `<code class="tg-code">${C}</code>` => {
	return `<code class="tg-code">${textSanitaizer(content) as C}</code>`;
};

export function pre<C extends string>(content: C): `<pre class="tg-pre-code"><code>${C}</code></pre>`;
export function pre<C extends string, L extends string>(
	content: C,
	language: L
): `<pre class="tg-pre-code"><code class="language-${L}">${C}</code></pre>`;

export function pre(content: string, language?: string) {
	return language === undefined
		? `<pre class="tg-pre-code"><code>${textSanitaizer(content)}</code></pre>`
		: `<pre class="tg-pre-code"><code class="language-${language}">${textSanitaizer(content)}</code></pre>`;
}

export const text_link = <C extends string, U extends string>(
	text: C,
	url: U
): `<a class="tg-text-link" href="${U}">${C}</a>` =>
	`<a class="tg-text-link" href="${url}">${textSanitaizer(text) as C}</a>`;

export const boldAndTextLink = <C extends string, U extends string>(
	text: C,
	url: U
): `<b class="tg-bold"><a class="tg-text-link" href="${U}">${C}</a></b>` =>
	`<b class="tg-bold"><a class="tg-text-link" href="${url}">${text}</a></b>`;

export const text_mention = <C extends string, U extends string>(
	name: C,
	id: U
): `<a class="tg-text-mention" href="tg://user?id=${U}">${C}</a>` =>
	`<a class="tg-text-mention" href="tg://user?id=${id}">${textSanitaizer(name) as C}</a>`;
