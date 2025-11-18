import type { UserFromGetMe } from "grammy/types";

export const onStart = ({ id, username, first_name }: UserFromGetMe) =>
	console.log(`${first_name} | @${username} [${id}] started!`);

export const normalizeName = ({
	first_name,
	last_name,
}: {
	first_name: string;
	last_name?: string | undefined | null;
}) => (last_name ? `${first_name} ${last_name}` : first_name);
