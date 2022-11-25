import { existsSync } from "node:fs";
import { resolve } from "node:path";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export function findPathOrExit(
	defaultPaths: () => Generator<string>,
	notFoundMessage: () => never,
): string {
	for (const fullPath of defaultPaths())
		if (existsSync(fullPath)) return fullPath;

	notFoundMessage();
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Constants:

const extensions = ["json", "ts", "mts", "cts", "js", "mjs", "cjs"] as const;
const hmrElectronConfig = "hmr-electron.config.";
const viteConfig = "vite.config.";

export function* defaultPathsForConfig() {
	for (const ext of extensions) yield resolve(`${hmrElectronConfig}${ext}`);
}

export function* defaultPathsForViteConfigFile() {
	for (const ext of extensions) yield resolve(`${viteConfig}${ext}`);

	for (const ext of extensions) yield resolve("src", `${viteConfig}${ext}`);

	for (const ext of extensions)
		yield resolve("src", "renderer", `${viteConfig}${ext}`);
}
