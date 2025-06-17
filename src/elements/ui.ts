import { createCanvas, loadImage } from "canvas";
import { desc } from "drizzle-orm";
import { Composer, InputFile } from "grammy";
import { resolve } from "path";

import { dick_history } from "../drizzle";
import type { Context } from "../utils";

export const userinfoComposer = new Composer<Context>();

const background = (await loadImage(
	resolve(process.cwd(), "src", "resources", "background.png")
)) as unknown as CanvasImageSource;
const background_purple = (await loadImage(
	resolve(process.cwd(), "src", "resources", "background-purple.png")
)) as unknown as CanvasImageSource;
const plus_icon = (await loadImage(
	resolve(process.cwd(), "src", "resources", "plus-icon.svg")
)) as unknown as CanvasImageSource;
const minus_icon = (await loadImage(
	resolve(process.cwd(), "src", "resources", "minus-icon.svg")
)) as unknown as CanvasImageSource;
const zero_icon = (await loadImage(
	resolve(process.cwd(), "src", "resources", "zero-icon.svg")
)) as unknown as CanvasImageSource;

const imageWidth: number = 1410 as const;
const imageHeight: number = 770 as const;

export const centerText = (
	ctx: CanvasRenderingContext2D,
	text: string,
	boxWidth: number,
	boxX: number,
	boxY: number
) => {
	const metrics = ctx.measureText(text);
	const textWidth = metrics.width;
	const textHeight = metrics.actualBoundingBoxAscent;

	return { textX: boxX + (boxWidth - textWidth) / 2, textY: boxY + textHeight };
};

export const drawUsername = (ctx: CanvasRenderingContext2D, text: string, boxX: number, boxY: number) => {
	ctx.font = `48px "SF Pro Display"`;
	ctx.fillStyle = "#FFFFFF";

	const { textX, textY } = centerText(ctx, text, 346, boxX, boxY);

	return ctx.fillText(text, textX, textY);
};

export const drawStatus = (ctx: CanvasRenderingContext2D, text: string, boxX: number, boxY: number) => {
	ctx.font = `32px "SF Pro Display"`;
	ctx.fillStyle = "#707579";

	const { textX, textY } = centerText(ctx, text, 298, boxX, boxY);

	return ctx.fillText(text, textX, textY);
};

export const drawDickSize = (ctx: CanvasRenderingContext2D, text: string, boxX: number, boxY: number) => {
	ctx.font = `32px "SF Pro Display"`;
	ctx.fillStyle = "#FFFFFF";

	const { textX, textY } = centerText(ctx, text, 98, boxX, boxY);

	return ctx.fillText(text, textX, textY);
};

export const drawLevelTitle = (ctx: CanvasRenderingContext2D, text: string, boxX: number, boxY: number) => {
	ctx.font = `24px "SF Pro Display"`;
	ctx.fillStyle = "#707579";

	const { textY } = centerText(ctx, text, 181, boxX, boxY);

	return ctx.fillText(text, boxX, textY);
};

export const drawDickHistory = async (
	ctx: CanvasRenderingContext2D,
	size: string,
	boxX: number,
	boxY: number,
	icon: CanvasImageSource,
	type: "plus" | "minus" | "zero"
) => {
	ctx.font = `20px "SF Pro Display"`;
	ctx.fillStyle = "#FFFFFF";

	const { textY: statusBoxY } = centerText(
		ctx,
		`Ваш dick ${type === "plus" ? "увеличился на" : type === "minus" ? "уменьшился на" : "не изменился"}`,
		181,
		boxX,
		boxY + 5
	);

	const { textY: sizeBoxY } = centerText(ctx, size, 181, boxX, boxY + 17 + 14);

	ctx.fillText(
		`Ваш dick ${type === "plus" ? "увеличился на" : type === "minus" ? "уменьшился на" : "не изменился"}`,
		boxX + 71,
		statusBoxY
	);
	ctx.fillText(size, boxX + 71, sizeBoxY);

	ctx.fillStyle = "#707579";
	const metrics = ctx.measureText(size);
	const textWidth = metrics.width;

	ctx.fillText("см", boxX + 75 + textWidth, sizeBoxY);

	return ctx.drawImage(icon, boxX, boxY);
};

export const drawAvatar = (
	ctx: CanvasRenderingContext2D,
	avatar: CanvasImageSource,
	boxX: number,
	boxY: number,
	boxSize: number = 172
) => {
	const radius = boxSize / 2;
	const centerX = boxX + radius;
	const centerY = boxY + radius;

	ctx.save();
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
	ctx.closePath();
	ctx.clip();

	ctx.drawImage(avatar, boxX, boxY, boxSize, boxSize);

	return ctx.restore();
};

userinfoComposer.command("userinfo", async ctx => {
	if (![946070039, 654382771, 629401289, 825720828, 1302930611, 759259922].includes(ctx.from!.id)) return;

	const name = ctx.from?.first_name + (ctx.from?.last_name ? ` ${ctx.from?.last_name}` : "");

	const dick = await ctx.database.resolveDick(ctx.from!, true, {
		history: { orderBy: desc(dick_history.created_at), limit: 3 },
	});
	const dickSize = dick.size;

	const canvas = createCanvas(imageWidth, imageHeight);
	const canvas_context = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;

	canvas_context.drawImage(Math.random() > 0.01 || ctx.from!.id !== 946070039 ? background : background_purple, 0, 0);

	const user_photo = (await ctx.api.getUserProfilePhotos(ctx.from?.id!)).photos;
	if (user_photo?.length) {
		const file = await ctx.api.getFile(user_photo[0]![0]!.file_id);

		const bun_file =
			process.env.LOCAL_API === undefined
				? await fetch(`https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path!}`)
				: Bun.file(file.file_path!);
		const buffer = Buffer.from(await bun_file.arrayBuffer());
		const avatar = (await loadImage(buffer)) as unknown as CanvasImageSource;
		drawAvatar(canvas_context, avatar, 924, 234);
	}

	drawUsername(canvas_context, name.length > 18 ? `${name.slice(0, 18)}...` : name, 840, 464);
	drawStatus(canvas_context, "Статус отсутствует", 861, 518);

	drawDickSize(canvas_context, dickSize.toString() + " см", 351, 195);
	drawLevelTitle(canvas_context, "Fucking Slave", 258, 274);

	dick.history.forEach(({ difference }, index) => {
		const diff = difference.toString().replace("-", "");
		const x: number = 149 as const;
		const y: number = 419 + index * 70;

		if (difference > 0) return drawDickHistory(canvas_context, diff, x, y, plus_icon, "plus");
		if (difference < 0) return drawDickHistory(canvas_context, diff, x, y, minus_icon, "minus");
		return drawDickHistory(canvas_context, diff, x, y, zero_icon, "zero");
	});

	const attachment = new InputFile(canvas.toBuffer(), "avatar.png");
	return ctx.replyWithPhoto(attachment);
});
