import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { desc } from "drizzle-orm";
import { Composer, InputFile } from "grammy";
import { resolve } from "path";

import type { UserinfoBackground } from "drizzle/utils";
import type { ChatMember } from "typegram";
import { dick_history } from "../drizzle";
import type { Context } from "../utils";

export const userinfoComposer = new Composer<Context>();

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
const font: string = "SF Pro Rounded" as const;

GlobalFonts.register(
	Buffer.from(await Bun.file(resolve(process.cwd(), "src", "resources", "SF-Pro-Rounded-Bold.otf")).arrayBuffer()),
	"SF Pro Rounded"
);

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
	ctx.font = `48px "${font}"`;
	ctx.fillStyle = "#FFFFFF";

	const { textX, textY } = centerText(ctx, text, 346, boxX, boxY);

	return ctx.fillText(text, textX, textY);
};

export const drawStatus = (ctx: CanvasRenderingContext2D, text: string, boxX: number, boxY: number) => {
	ctx.font = `32px "${font}"`;
	ctx.fillStyle = "#707579";

	const { textX, textY } = centerText(ctx, text, 298, boxX, boxY);

	return ctx.fillText(text, textX, textY);
};

export const drawDickSize = (ctx: CanvasRenderingContext2D, text: string, boxX: number, boxY: number) => {
	ctx.font = `32px "${font}"`;
	ctx.fillStyle = "#FFFFFF";

	const { textX, textY } = centerText(ctx, text, 98, boxX, boxY);

	return ctx.fillText(text, textX, textY);
};

export const drawLevelTitle = (ctx: CanvasRenderingContext2D, text: string, boxX: number, boxY: number) => {
	ctx.font = `24px "${font}"`;
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
	ctx.font = `20px "${font}"`;
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
	boxSize: number = 174
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

// export const drawFadedRoundedAvatar = (
// 	ctx: CanvasRenderingContext2D,
// 	avatar: CanvasImageSource,
// 	boxX: number,
// 	boxY: number
// ) => {
// 	const w = 540;
// 	const h = 510;
// 	const r = Math.min(w, h) / 24;

// 	const tempCanvas = createCanvas(w, h);
// 	const tempCtx = tempCanvas.getContext("2d") as unknown as CanvasRenderingContext2D;

// 	tempCtx.beginPath();
// 	tempCtx.moveTo(r, 0);
// 	tempCtx.arcTo(w, 0, w, r, r);
// 	tempCtx.arcTo(w, h, w - r, h, r);
// 	tempCtx.arcTo(0, h, 0, h - r, r);
// 	tempCtx.arcTo(0, 0, r, 0, r);
// 	tempCtx.closePath();
// 	tempCtx.clip();

// 	tempCtx.drawImage(avatar, 0, 0, w, h);

// 	const gradient = tempCtx.createLinearGradient(0, 0, 0, h);
// 	gradient.addColorStop(0, "rgba(0, 0, 0, 0.08)");
// 	gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

// 	tempCtx.globalCompositeOperation = "destination-in";
// 	tempCtx.fillStyle = gradient;

// 	tempCtx.fillRect(0, 0, w, h + 1);

// 	ctx.drawImage(tempCanvas as unknown as CanvasImageSource, boxX, boxY);
// };

export const getBackground = async (background: UserinfoBackground = "blue") => {
	if (!background.endsWith(".png")) background += ".png";

	const backgroundPath = resolve(process.cwd(), "src", "resources", `background-${background}`);
	const isExists = await Bun.file(backgroundPath).exists();

	return loadImage(
		isExists ? backgroundPath : resolve(process.cwd(), "src", "resources", `background-blue.png`)
	) as unknown as CanvasImageSource;
};

userinfoComposer.command("userinfo", async ctx => {
	const name = ctx.from?.first_name + (ctx.from?.last_name ? ` ${ctx.from?.last_name}` : "");

	const dick = await ctx.database.resolveDick(ctx.from!, true, {
		history: { orderBy: desc(dick_history.created_at), limit: 3, columns: { difference: true } },
	});
	const { background } = await ctx.database.resolveMSDBotUser(ctx.from!, true);

	const dickSize = dick.size;

	const canvas = createCanvas(imageWidth, imageHeight);
	const canvas_context = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;

	canvas_context.drawImage(await getBackground(background), 0, 0);

	const customTitle = ((await ctx.getChatMember(ctx.from!.id)) as ChatMember & { custom_title?: string })
		?.custom_title;
	const status = customTitle
		? customTitle.length > 29
			? customTitle.slice(0, 26) + "..."
			: customTitle
		: "Статус отсутствует";

	drawUsername(canvas_context, name.length > 18 ? `${name.slice(0, 18)}...` : name, 837, 454);
	drawStatus(canvas_context, status, 837, 508);

	drawDickSize(canvas_context, dickSize.toString() + " см", 351, 195);
	drawLevelTitle(canvas_context, "Fucking Slave", 258, 274);

	const user_photo = (await ctx.api.getUserProfilePhotos(ctx.from?.id!)).photos;
	if (user_photo?.length) {
		const file = await ctx.api.getFile(user_photo[0]![0]!.file_id);

		const bun_file =
			process.env.LOCAL_API === undefined
				? await fetch(`https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path!}`)
				: Bun.file(file.file_path!);
		const buffer = Buffer.from(await bun_file.arrayBuffer());
		const avatar = (await loadImage(buffer)) as unknown as CanvasImageSource;

		drawAvatar(canvas_context, avatar, 924 - 1, 238 - 1);
	}

	if (dick?.history?.length > 0) {
		dick.history.forEach(({ difference }, index) => {
			const diff = difference.toString().replace("-", "");
			const x: number = 150 as const;
			const y: number = 419 + index * 70;

			if (difference > 0) return drawDickHistory(canvas_context, diff, x, y, plus_icon, "plus");
			if (difference < 0) return drawDickHistory(canvas_context, diff, x, y, minus_icon, "minus");
			return drawDickHistory(canvas_context, diff, x, y, zero_icon, "zero");
		});
	}

	const attachment = new InputFile(canvas.toBuffer("image/png"), "avatar.png");
	return ctx.replyWithPhoto(attachment, {
		caption: [
			`👤 <b>Информация о:</b> ${name} [<code>${ctx.from?.id}</code>]\n`,
			`• <b>Текущий размер dick:</b> <code>${dickSize}</code> см`,
		].join("\n"),
	});
});
