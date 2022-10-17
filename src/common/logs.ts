import { log } from "node:console";

import { getPrettyDate } from "@utils/getPrettyDate";
import {
	underline,
	bgYellow,
	bgGreen,
	borderY,
	black,
	green,
	blue,
	bold,
	red,
} from "@utils/cli-colors";

export const viteConsoleMessagePrefix = bgGreen(bold(black("[VITE]")));
export const hmrElectronConsoleMessagePrefix = bgYellow(
	bold(black("[hmr-electron]")),
);

export function configFilePathNotFound(): never {
	throwPrettyError(
		`No config file (${underline("'hmr-electron.config.ts'")}) found.`,
	);
}

export function fileNotFound(file: string, path: string | undefined): string {
	return `File ${underline(green(`"${file}"`))} not found. Received: ${
		blue(path)
	}`;
}

export function viteConfigFileNotFound(): never {
	throwPrettyError(
		`Vite config file for main process ${underline("NOT")} found.`,
	);
}

export function throwPrettyError(msg: any): never {
	msg = `
${red(borderY)}
${getPrettyDate()} ${msg}
${red(borderY)}
`;

	throw new Error(msg);
}

export function prettyPrintStringArray<T>(arr: readonly T[]): string {
	const arrayItems = arr.map(item => green(`"${item}"`)).join(", ");

	return `[ ${arrayItems} ]`;
}

export function hmrElectronLog(...args: unknown[]): void {
	log(
		getPrettyDate(),
		hmrElectronConsoleMessagePrefix,
		...args,
	);
}

export function viteLog(...args: unknown[]): void {
	log(
		getPrettyDate(),
		viteConsoleMessagePrefix,
		...args,
	);
}
