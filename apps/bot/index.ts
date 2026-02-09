import GelbooruClient from "gelbooru-api";

const gelbooru = new GelbooruClient();
const res = await gelbooru.getPostById("12610000");

console.log(res);
