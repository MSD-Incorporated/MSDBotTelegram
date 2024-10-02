import { Composer, InlineKeyboard } from "grammy";

export const githubLinkComposer = new Composer();
const githubRegexLink =
	/(?:https?:\/\/)?(?:www\.)?(?:github)\.com\/(?<repo>[a-zA-Z0-9-_]+\/[A-Za-z0-9_.-]+)\/blob\/(?<path>.+?)#L(?<first_line_number>\d+)[-~]?L?(?<second_line_number>\d*)/i;

export function safeSlice<T extends string | Array<any>>(input: T, length: number): T {
	return <T>(input.length > length ? input.slice(0, length) : input);
}
// Thanks to https://github.com/xhyrom/bun-discord-bot
githubLinkComposer.hears(githubRegexLink, async ctx => {
	const match = githubRegexLink.exec(ctx.message?.text!);
	const groups = match?.groups;
	if (!groups) return;

	const repo = groups.repo!;
	const path = groups.path!;

	const firstLineNumber = parseInt(groups.first_line_number!) - 1;
	const secondLineNumber = parseInt(groups.second_line_number!) || firstLineNumber + 1;

	const contentUrl = `https://raw.githubusercontent.com/${repo}/${path}`;
	const response = await fetch(contentUrl);
	const content = await response.text();
	const lines = content.split("\n");

	if (secondLineNumber - firstLineNumber > 25 && lines.length > secondLineNumber) return ctx.react("👎");

	let text = "";

	for (let i = 0; i < lines.length; i++) {
		if (i < firstLineNumber || i >= secondLineNumber) continue;

		const line = lines[i];
		text += `${line?.replace(/	/g, "    ")}\n`;
	}

	return ctx.reply(
		[
			`<code>${path?.split("/").slice(1).join("/").replace(/%2F/g, "/")}</code> — <b>(L${firstLineNumber + 1}${secondLineNumber ? `-L${secondLineNumber}` : ""})</b>`,
			`<pre class="tg-pre-code">${safeSlice(text.slice(0, -1), 4090).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`,
		].join("\n"),
		{
			parse_mode: "HTML",
			reply_markup: new InlineKeyboard().add({
				text: repo!,
				url: `https://github.com/${repo}/blob/${path}#L${
					firstLineNumber + 1
				}${secondLineNumber ? `-L${secondLineNumber}` : ""}`,
			}),
		}
	);
});
