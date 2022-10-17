import { existsSync } from "node:fs";
import { resolve } from "node:path";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export function findPathOrExit(
	defaultPaths: string[],
	notFoundMessage: () => never,
): string {
	for (const defaultPlace of defaultPaths) {
		const fullPath = resolve(defaultPlace);

		if (existsSync(fullPath)) return fullPath;
	}

	notFoundMessage();
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Constants:

export const defaultPathsForConfig = [
	"./hmr-electron.config.json",

	"./hmr-electron.config.cts",
	"./hmr-electron.config.mts",
	"./hmr-electron.config.ts",

	"./hmr-electron.config.cjs",
	"./hmr-electron.config.mjs",
	"./hmr-electron.config.js",
];

///////////////////////////////////////////

export const defaultPathsForViteConfigFile = [
	"./src/renderer/vite.config.cts",
	"./src/renderer/vite.config.mts",
	"./src/renderer/vite.config.ts",

	"./src/renderer/vite.config.cjs",
	"./src/renderer/vite.config.mjs",
	"./src/renderer/vite.config.js",

	"./src/vite.config.cts",
	"./src/vite.config.mts",
	"./src/vite.config.ts",

	"./src/vite.config.cjs",
	"./src/vite.config.mjs",
	"./src/vite.config.js",

	"./vite.config.cts",
	"./vite.config.mts",
	"./vite.config.ts",

	"./vite.config.cjs",
	"./vite.config.mjs",
	"./vite.config.js",
];
