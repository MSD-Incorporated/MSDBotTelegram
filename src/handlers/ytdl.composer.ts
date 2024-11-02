import { createWriteStream, unlink } from "fs";
import { Composer, InputFile } from "grammy";
import { tmpdir } from "os";
import { join } from "path";
import YTDlpWrap from "yt-dlp-wrap";

export const YTDLComposer = new Composer();
const ytDlpWrap = new YTDlpWrap();

YTDLComposer.hears(
	/https?:\/\/(?:www\.tiktok\.com\/(?:embed\/|@[\w.-]+?\/video\/)|(?:vm|vt)\.tiktok\.com\/|www\.tiktok\.com\/t\/)([\w\d]+)/i,
	async ctx => {
		// if (ctx.chatId !== -1001705068191) return;

		const url = ctx.match[0];
		const metadata = await ytDlpWrap.getVideoInfo(url);

		console.log(metadata);

		const formattedMetadata = metadata
			? [
					`Название: <code>${metadata.title}</code>\n`,
					`Количество просмотров: <code>${metadata.view_count}</code>`,
					`Количество лайков: <code>${metadata.like_count}</code>`,
					`Количество комментариев: <code>${metadata.comment_count}</code>`,
					`Количество репостов: <code>${metadata.repost_count}</code>`,
				].join("\n")
			: "Метаданные видео недоступны";

		const stream = ytDlpWrap.execStream([url]);
		const tempFilePath = join(tmpdir(), `download-${Date.now()}.mp4`);
		const fileStream = createWriteStream(tempFilePath);

		stream.pipe(fileStream);

		fileStream.on("finish", async () => {
			await ctx.replyWithVideo(new InputFile(tempFilePath), {
				caption: formattedMetadata,
				parse_mode: "HTML",
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "Автор",
								url: metadata.uploader_url,
							},
							{
								text: "Ссылка на видео",
								url,
							},
						],
					],
				},
			});

			unlink(tempFilePath, err => {
				if (err) console.error(`Не удалось удалить файл ${tempFilePath}`, err);
			});
		});
	}
);
