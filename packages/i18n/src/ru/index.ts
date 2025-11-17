import { BUN_URL, DEVELOPER, INFOMRATION_CHANNEL, MSDBOT_URL, NODEJS_URL } from "../constants";
import { blockquote, bold, boldAndTextLink, code } from "../formatters";
import type { BaseTranslation } from "../i18n-types";

const ru = {
	start_command: [
		`${bold("👋 Добро пожаловать!")}\n`,
		`• ${bold(`Версия`)} ${boldAndTextLink("MSDBot", MSDBOT_URL)} — ${code("v{msdbot_version:string}")} [${code("{commit:string}")}]`,
		`• ${bold("Версия")} ${boldAndTextLink("NodeJS", NODEJS_URL)} — ${code("{version:string}")}`,
		`• ${bold("Версия")} ${boldAndTextLink("Bun", BUN_URL)} — ${code("v{bun_version:string}")}\n`,
		[boldAndTextLink(`🧑‍💻 Разработчик`, DEVELOPER), boldAndTextLink("📰 Канал", INFOMRATION_CHANNEL)].join("丨"),
	].join("\n"),
	im_here: [
		bold("👋 Я тут!\n"),
		blockquote(bold("❓ Не можете разобраться?"), false),
		[bold("Просто напишите"), code("/"), bold("после чего, вы получите список имеющихся у меня команд!")].join(" "),
	].join("\n"),
} satisfies BaseTranslation;

export default ru;
