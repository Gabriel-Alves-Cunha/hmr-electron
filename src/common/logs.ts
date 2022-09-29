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
} from "#utils/cli-colors";

export const consoleMessagePrefix = bgYellow(bold(black("[hmr-electron]")));
export const viteConsoleMessagePrefix = bgGreen(bold(black("[VITE]")));

export const finishBuildMessage = green(
	`${consoleMessagePrefix} Build finished.`,
);

export function entryFilePathNotFound(path: string | undefined) {
	return () =>
		throwPrettyError(
			`${underline("entryFilePath")} not found. Received: ${
				blue(String(path))
			}`,
		);
}

export function configFilePathNotFound() {
	return () =>
		throwPrettyError(
			`No config file (${underline("'hmr-electron.config.ts'")}) found.`,
		);
}

export function fileNotFound(file: string, path: string | undefined): never {
	throwPrettyError(
		`File ${underline(green(`"${file}"`))} not found. Received: ${
			blue(String(path))
		}`,
	);
}

export function viteConfigFileNotFound(cwd: string) {
	return () =>
		throwPrettyError(
			`Vite config file for main process in "${cwd}" ${
				underline("NOT")
			} found.`,
		);
}

export function throwPrettyError(msg: string): never {
	throw new Error(red(`\n${borderY}\n${msg}\n${borderY}`));
}

export function prettyPrintStringArray<T>(arr: readonly T[]): string {
	const s = arr.map(item => green(`"${item}"`)).join(", ");

	return `[${s}]`;
}
