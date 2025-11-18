import im_here_image from "./assets/im_here.png" with { type: "file" };
import referral_image from "./assets/referral.png" with { type: "file" };

export const im_here_banner = await Bun.file(im_here_image).bytes();
export const referral_banner = await Bun.file(referral_image).bytes();
