import { Composer, InputFile } from "grammy";
import { resolve } from "path";
import { cwd } from "process";
import type { Context } from "../utils";

const chatChannelID = -1001705068191;

export const msdIncorporatedComposer = new Composer<Context>();

msdIncorporatedComposer.on(":new_chat_members", async ctx => {
	if (ctx.chat.id !== chatChannelID) return;
	ctx.replyWithAnimation(new InputFile(resolve(cwd(), "src", "media", "welcome.gif")));
});
