import { BUN_URL, DEVELOPER, INFOMRATION_CHANNEL, MSDBOT_URL, NODEJS_URL } from "../constants";
import { bold, boldAndTextLink, code } from "../formatters";
import type { BaseTranslation } from "../i18n-types";

const ru = {
	start_command: [
		`${boldAndTextLink("👋 Добро пожаловать!", INFOMRATION_CHANNEL)}\n`,
		`• ${bold(`Версия`)} ${boldAndTextLink("MSDBot", MSDBOT_URL)} — ${code("v{msdbot_version:string}")}`,
		`• ${bold("Версия")} ${boldAndTextLink("NodeJS", NODEJS_URL)} — ${code("{version:string}")}`,
		`• ${bold("Версия")} ${boldAndTextLink("Bun", BUN_URL)} — ${code("v{bun_version:string}")}\n`,
		boldAndTextLink(`🧑‍💻 Разработчик`, DEVELOPER),
	].join("\n"),
} satisfies BaseTranslation;

export default ru;
