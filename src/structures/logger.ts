import ck from "chalk";
import { dateFormatter } from "utils";

export class Logger {
	public readonly icons = {
		success: "✓",
		fail: "◇",
		error: "✖︎",
		warn: "▲",
		cursor: "→",
		menu: "☰",
		circle: "●",
		"top-left": "╭",
		"top-right": "╮",
		"bottom-right": "╯",
		"bottom-left": "╰",
		back: "⤶",
		right: "➞",
	} as const;

	public readonly ck: typeof ck = ck;

	constructor() {}

	public readonly success = <T>(...data: T[]) => console.log(`${ck.green(this.icons["success"])}`, ...data);
	public readonly fail = <T>(...data: T[]) => console.log(`${ck.red(this.icons["fail"])}`, ...data);
	public readonly error = <T>(...data: T[]) => console.log(`${ck.red(this.icons["error"])}`, ...data);
	public readonly warn = <T>(...data: T[]) => console.log(`${ck.yellow(this.icons["warn"])}`, ...data);
	public readonly custom = <P extends string, T>(prefix: P, ...data: T[]) =>
		console.log(ck.grey(`[${dateFormatter.format(Date.now())}]`), prefix, ...data);
}
