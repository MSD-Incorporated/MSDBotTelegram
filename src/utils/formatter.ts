import { ParseMode } from "typegram";

export const textSanitaizer = (text: string) =>
	text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");

export class Formatter {
	readonly type: ParseMode;

	constructor(type?: ParseMode) {
		this.type = type ?? "HTML";
	}

	readonly blockqoute = (content: string): string => {
		return `<blockquote class="tg-blockquote">${textSanitaizer(content)}</blockquote>`;
	};

	readonly bold = (content: string): string => {
		return `<b class="tg-bold">${textSanitaizer(content)}</b>`;
	};

	readonly pre = (content: string, language?: string): string => {
		return language === undefined
			? `<pre class="tg-pre-code"><code>${textSanitaizer(content)}</code></pre>`
			: `<pre class="tg-pre-code"><code class="language-${language}">${textSanitaizer(content)}</code></pre>`;
	};
}
