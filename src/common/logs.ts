import {
	underline,
	bgYellow,
	borderY,
	black,
	green,
	blue,
	red,
} from "#utils/cli-colors";

export const consoleMessagePrefix = bgYellow(black("[hmr-electron]"));

export const finishBuildMessage = green(
	`${consoleMessagePrefix} Build finished.`,
);

export const entryFilePathNotFound = (path: string | undefined) =>
	() =>
		prettyError(
			`${underline("entryFilePath")} not found. Received: ${
				blue(String(path))
			}`,
		);

export const configFilePathNotFound = () =>
	() =>
		prettyError(
			`No config file ${underline("(\"hmr-electron.config.ts\")")} found.`,
		);

export const fileNotFound = (file: string, path: string | undefined) =>
	prettyError(`${underline(file)} not found. Received: ${blue(String(path))}`);

export const viteConfigFileNotFound = (cwd: string) =>
	() =>
		prettyError(
			`Vite config file for main process in "${cwd}" ${
				underline("NOT")
			} found.`,
		);

export function prettyError(msg: string) {
	return new Error(red(`\n${borderY}\n${msg}\n${borderY}`));
}

export function prettyPrintStringArray<T>(arr: readonly T[]): string {
	const s = arr.map(item => green(`"${item}"`)).join(", ");

	return `[${s}]`;
}
