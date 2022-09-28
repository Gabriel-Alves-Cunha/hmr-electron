const wrap = (a: number, b: number) =>
	(msg: string) => `\u001b[${a}m${msg}\u001b[${b}m`;

export const underline = wrap(4, 24);
export const bold = wrap(1, 22);

export const bgYellow = wrap(43, 49);
export const bgGreen = wrap(42, 49);
export const bgBlue = wrap(44, 49);
export const bgRed = wrap(31, 49);

export const magenta = wrap(35, 39);
export const yellow = wrap(33, 39);
export const white = wrap(37, 39);
export const green = wrap(32, 39);
export const black = wrap(30, 39);
export const blue = wrap(34, 39);
export const gray = wrap(90, 39);
export const cyan = wrap(36, 39);
export const red = wrap(31, 39);

export const borderY =
	"────────────────────────────────────────────────────────────────────────────────";
