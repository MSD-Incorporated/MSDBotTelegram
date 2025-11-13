import { User } from "typegram";

export const onStart = ({ id, username, first_name }: User) =>
	console.log(`${first_name} | @${username} [${id}] started!`);
