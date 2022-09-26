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

export const entryFilePathNotFound = (path: string | undefined) =>
	() =>
		new Error(red(`\
${borderY}
${underline("entryFilePath")} not found. Received: ${blue(String(path))}
${borderY}`));

export const fileNotFound = (file: string, path: string | undefined) =>
	new Error(red(`\
${borderY}
${underline(file)} not found. Received: ${blue(String(path))}
${borderY}`));

export const finishBuildMessage = green(
	`${consoleMessagePrefix} Build finished.`,
);

export const viteConfigFileNotFound = (cwd: string) =>
	() =>
		new Error(red(`\
${borderY}
Vite config file for main process in "${cwd}" ${underline("NOT")} found.
${borderY}`));
