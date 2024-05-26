import type { Context } from "grammy";
import { DEVELOPERS } from "../../../config";

export const testCommand = (ctx: Context) => {
	if (!(Array.isArray(DEVELOPERS) ? DEVELOPERS.includes(ctx.from?.id) : DEVELOPERS === ctx.from?.id)) return;

	ctx.api.sendInvoice(ctx.chat!.id, "Test", "Hello from MSDBot", "1", process.env.TEST_PROVIDER_TOKEN, "XTR", [
		{ amount: 100, label: "Test" },
	]);
};
