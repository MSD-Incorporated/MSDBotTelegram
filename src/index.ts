import { Bot } from "grammy";
import { Formatter } from "./utils/formatter";

const client = new Bot(process.env.TOKEN);
const formatter = new Formatter("HTML");

client.api.sendMessage(946070039, formatter.pre("console.log('Hello world')", "typescript"), {
	parse_mode: "HTML",
});
