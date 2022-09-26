import { bgYellow, black, green, red } from "yoctocolors";

export const consoleMessagePrefix = bgYellow(black("[hmr-electron]"));

export const entryFilePathNotFound = (path: string | undefined) =>
	() => new Error(red(`entryFilePath not found. Received: ${path}`));

export const fileNotFound = (file: string, path: string | undefined) =>
	new Error(red(`${file} not found. Received: ${path}`));

export const finishBuildMessage = green(
	`${consoleMessagePrefix} Build finished.`,
);

export const viteConfigFileNotFound = (cwd: string) =>
	() =>
		new Error(red(`Vite config file for main process in "${cwd}" NOT found.`));
