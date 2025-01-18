export const random = <MIN extends number, MAX extends number, IM extends boolean>(
	min: MIN,
	max: MAX,
	includeMax?: IM
) => Math.floor(Math.random() * (max - min + (includeMax ? 1 : 0)) + min);
