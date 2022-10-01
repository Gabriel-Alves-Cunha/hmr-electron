import { getPrettyDate } from "#utils/getPrettyDate";
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

export const hmrElectronConsoleMessagePrefix = bgYellow(
	bold(black("[hmr-electron]")),
);
export const viteConsoleMessagePrefix = bgGreen(bold(black("[VITE]")));

export const finishBuildMessage = hmrElectronConsoleMessagePrefix + green(
	" Build finished.",
);

export function entryFilePathNotFound(path: string | undefined): () => never {
	return () =>
		throwPrettyError(
			`${underline("entryFilePath")} not found. Received: ${blue(path)}`,
		);
}

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

export function viteConfigFileNotFound(cwd: string): () => never {
	return () =>
		throwPrettyError(
			`Vite config file for main process in "${cwd}" ${
				underline("NOT")
			} found.`,
		);
}

export function throwPrettyError(msg: any): never {
	throw new Error(
		red(`
${borderY}
${getPrettyDate()} ${msg}
${borderY}
`),
	);
}

export function prettyPrintStringArray<T>(arr: readonly T[]): string {
	const s = arr.map(item => green(`"${item}"`)).join(", ");

	return `[${s}]`;
}
