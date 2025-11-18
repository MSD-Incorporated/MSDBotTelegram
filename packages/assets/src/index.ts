import im_here_image from "./assets/im_here.png" with { type: "file" };

export const im_here_banner = await Bun.file(im_here_image).bytes();
