import { bgYellow, black, green, red } from "yoctocolors";

import pkg from "../../package.json";

export const consoleMessagePrefix = bgYellow(black(`[${pkg.name}]`));

export const entryFilePathNotFound = (path: string | undefined) =>
	new Error(red(`entryFilePath not found. Received: ${path}`));

export const finishBuildMessage = green(
	`${consoleMessagePrefix} Build finished.`,
);
