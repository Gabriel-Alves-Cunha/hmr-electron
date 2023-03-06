import { log } from "node:console";

import { getPrettyDate } from "@utils/getPrettyDate.js";
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
} from "@utils/cli-colors.js";

export const viteConsoleMessagePrefix = bgGreen(bold(black("[VITE]")));
export const hmrElectronConsoleMessagePrefix = bgYellow(
	bold(black("[hmr-electron]")),
);

export const configFilePathNotFound = (): never =>
	throwPrettyError(
		`No config file (${underline("'hmr-electron.config.ts'")}) found.`,
	);

export const fileNotFound = (file: string, path: string | undefined): string =>
	`File ${underline(green(`"${file}"`))} not found. Received: ${blue(path)}`;

export const viteConfigFileNotFound = (): never =>
	throwPrettyError(
		`Vite config file for main process ${underline("NOT")} found.`,
	);

export function throwPrettyError(msg: string): never {
	msg = `
${red(borderY)}
${getPrettyDate()} ${msg}
${red(borderY)}
`;

	throw new Error(msg);
}

export function prettyPrintStringArray<T>(array: readonly T[]): string {
	const prettyItems: string[] = [];

	for (const item of array) prettyItems.push(green(`"${item}"`));

	return `[ ${prettyItems.join(", ")} ]`;
}

export const hmrElectronLog = (...args: unknown[]): void =>
	log(getPrettyDate(), hmrElectronConsoleMessagePrefix, ...args);

export const viteLog = (...args: unknown[]): void =>
	log(getPrettyDate(), viteConsoleMessagePrefix, ...args);
