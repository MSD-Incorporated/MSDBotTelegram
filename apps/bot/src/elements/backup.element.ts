import database, { count, referrals, users } from "@msdbot/database";
import env from "@msdbot/env";
import { BackupType, createBackup, type BackupConfig } from "backupx";
import { Bot, Composer, InputFile, type Api } from "grammy";
import cron from "node-cron";

import { type Context } from "../utils";

const config: BackupConfig = {
	verbose: true,
	outputPath: "./backups",
	databases: [
		{
			type: BackupType.POSTGRESQL,
			name: "database",
			connection: `postgres://${env.DATABASE.USER}:${env.DATABASE.PASSWORD}@${env.DATABASE.HOST}:${env.DATABASE.PORT}/${env.DATABASE.DATABASE}`,
		},
	],
	files: [],
	retention: {
		count: 5,
		maxAge: 30,
	},
};

export class BackupElement {
	private bot: Bot<Context>;
	public composer: Composer<Context>;

	constructor(bot: Bot<Context>) {
		this.bot = bot;
		this.composer = new Composer<Context>();
		this.composer
			.chatType(["private"])
			.filter(ctx => ctx.from.id === 946070039)
			.command("backup", async ctx => {
				await ctx.reply("Creating backup...");
				try {
					await this.createAndSendBackup(ctx.api);
					await ctx.reply("Backup created and sent.");
				} catch (error) {
					console.error(error);
					await ctx.reply("Failed to create backup.");
				}
			});
	}

	private async createAndSendBackup(api: Api) {
		const summary = await createBackup(config);

		if (summary.databaseBackups.length > 0 && summary.databaseBackups[0]?.filename) {
			const backupFile = Bun.file(`./backups/${summary.databaseBackups[0]!.filename}`);

			const [usersCount, dicksCount, referralsCount] = await Promise.all([
				database.db
					.select({ count: count() })
					.from(users)
					.then(res => res[0]?.count ?? 0),
				database.dicks.countLeaderboard(),
				database.db
					.select({ count: count() })
					.from(referrals)
					.then(res => res[0]?.count ?? 0),
			]);

			const caption = [
				`<b>💾 Database Backup</b>`,
				``,
				`<b>📅 Date:</b> ${new Date().toUTCString()}`,
				``,
				`<b>👥 Users:</b> <code>${usersCount}</code>`,
				`<b>✏️ Dicks:</b> <code>${dicksCount}</code>`,
				`<b>🫂 Referrals:</b> <code>${referralsCount}</code>`,
			].join("\n");

			await api.sendDocument(
				-1001920317075,
				new InputFile(Buffer.from(await backupFile.arrayBuffer()), backupFile.name),
				{ caption, message_thread_id: 10357, parse_mode: "HTML" }
			);

			await backupFile.delete();
		}
	}

	public readonly startCron = () =>
		cron.schedule("0 0 0 * * *", () => this.createAndSendBackup(this.bot.api), { timezone: env.TZ }).start();
}
