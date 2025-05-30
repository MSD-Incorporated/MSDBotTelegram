import { Logger } from "./src/structures/logger";

const logger = new Logger();

console.log(
	logger.ck.grey(`{/} |`),
	logger.ck.greenBright("MasedMSD"),
	logger.ck.grey("[") + logger.ck.greenBright("94444") + logger.ck.grey("] used command"),
	logger.ck.greenBright("/start")
);

console.log(
	logger.ck.grey(logger.icons["menu"], `| User`),
	logger.ck.greenBright("MasedMSD"),
	logger.ck.grey("[") + logger.ck.greenBright("94444") + logger.ck.grey("]"),
	logger.ck.redBright("not found!"),
	logger.ck.yellowBright("Creating new user...")
);
