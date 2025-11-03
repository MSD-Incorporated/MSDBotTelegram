import { L } from "@msdbot/i18n";
import { client } from "./structures/client";

client.chatType(["group", "supergroup", "private"]).command("start", async ctx => {
	return ctx.reply(L.ru.HI({ name: ctx.from.first_name }));
});
