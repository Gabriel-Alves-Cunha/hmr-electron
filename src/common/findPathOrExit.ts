import { existsSync } from "node:fs";
import { join } from "node:path";

export function findPathOrExit(
	defaultPaths: string[],
	notFoundMessage: () => Error,
): string {
	for (const defaultPlace of defaultPaths) {
		const path = join(process.cwd(), defaultPlace);

		if (existsSync(path)) return path;
	}

	console.error(notFoundMessage);
	process.exit();
}

export const defaultPathsForConfig = [
	"./hmr-electron.config.json",

	"./hmr-electron.config.cts",
	"./hmr-electron.config.mts",
	"./hmr-electron.config.ts",

	"./hmr-electron.config.cjs",
	"./hmr-electron.config.mjs",
	"./hmr-electron.config.js",
];

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

export const entryFileDefaultPlaces = [
	"./src/main/index.cjs",
	"./src/main/index.mjs",
	"./src/main/index.js",

	"./src/main/index.cts",
	"./src/main/index.mts",
	"./src/main/index.ts",

	"./src/index.cjs",
	"./src/index.mjs",
	"./src/index.js",

	"./src/index.cts",
	"./src/index.mts",
	"./src/index.ts",

	"./index.cjs",
	"./index.mjs",
	"./index.js",

	"./index.cts",
	"./index.mts",
	"./index.ts",
];
