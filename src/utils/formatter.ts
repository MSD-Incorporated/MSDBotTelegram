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

export const pre = (content: string, language?: string): string => {
	return language === undefined
		? `<pre class="tg-pre-code"><code>${textSanitaizer(content)}</code></pre>`
		: `<pre class="tg-pre-code"><code class="language-${language}">${textSanitaizer(content)}</code></pre>`;
};
