const ansi = (a: number, b: number) => (msg: unknown) =>
	`\x1B[${a}m${msg}\x1B[${b}m`;

export const underline = ansi(4, 24);
export const bold = ansi(1, 22);

export const bgMagenta = ansi(45, 49);
export const bgYellow = ansi(43, 49);
export const bgGreen = ansi(42, 49);
export const bgBlue = ansi(44, 49);
export const bgRed = ansi(31, 49);

export const magenta = ansi(35, 39);
export const yellow = ansi(33, 39);
export const white = ansi(37, 39);
export const green = ansi(32, 39);
export const black = ansi(30, 39);
export const blue = ansi(34, 39);
export const gray = ansi(90, 39);
export const cyan = ansi(36, 39);
export const red = ansi(31, 39);

export const borderX =
	"────────────────────────────────────────────────────────────────────";
