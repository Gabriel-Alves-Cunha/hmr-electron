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

const hmrElectronConfig = "./hmr-electron.config";
export const defaultPathsForConfig = [
	`${hmrElectronConfig}.json`,

	`${hmrElectronConfig}.cts`,
	`${hmrElectronConfig}.mts`,
	`${hmrElectronConfig}.ts`,

	`${hmrElectronConfig}.cjs`,
	`${hmrElectronConfig}.mjs`,
	`${hmrElectronConfig}.js`,
];

const viteConfig = "vite.config";
export const defaultPathsForViteConfigFile = [
	`./src/renderer/${viteConfig}.cts"`,
	`./src/renderer/${viteConfig}.mts"`,
	`./src/renderer/${viteConfig}.ts"`,

	`./src/renderer/${viteConfig}.cjs"`,
	`./src/renderer/${viteConfig}.mjs"`,
	`./src/renderer/${viteConfig}.js"`,

	`./src/${viteConfig}.cts"`,
	`./src/${viteConfig}.mts"`,
	`./src/${viteConfig}.ts"`,

	`./src/${viteConfig}.cjs"`,
	`./src/${viteConfig}.mjs"`,
	`./src/${viteConfig}.js"`,

	`./${viteConfig}.cts"`,
	`./${viteConfig}.mts"`,
	`./${viteConfig}.ts"`,

	`./${viteConfig}.cjs"`,
	`./${viteConfig}.mjs"`,
	`./${viteConfig}.js"`,
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
