export const random = (min: number, max: number, maxIncluded?: boolean): number =>
	maxIncluded ? Math.floor(Math.random() * (max - min + 1)) + min : Math.floor(Math.random() * (max - min)) + min;
