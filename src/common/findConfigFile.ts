import { existsSync } from "node:fs";
import { join } from "node:path";

export function findPathOrExit(
	defaultPaths: string[],
	notFoundMessage: Error,
): string {
	for (const defaultPlace of defaultPaths) {
		const path = join(process.cwd(), defaultPlace);

		if (existsSync(path)) return path;
	}

	console.error(notFoundMessage);
	process.exit();
}

export const defaultPathsForConfig = [
	"hmr-electron.config.json",
	"hmr-electron.config.ts",
	"hmr-electron.config.js",
];
