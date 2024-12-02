import { ParseMode } from "typegram";

export class Formatter {
	readonly type: ParseMode;

	constructor(type?: ParseMode) {
		this.type = type ?? "HTML";
	}

	readonly blockqoute = (content: string): string => {
		return `<blockquote class="tg-blockquote">${content}</blockquote>`;
	};

	readonly bold = (content: string): string => {
		return `<b class="tg-bold">${content}</b>`;
	};

	readonly pre = (content: string, language?: string): string => {
		return language === undefined
			? `<pre class="tg-pre-code"><code>${content}</code></pre>`
			: `<pre class="tg-pre-code"><code class="language-${language}">${content}</code></pre>`;
	};
}
