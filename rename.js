import { readdirSync, renameSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ignore = [
	"node_modules",
	".config.ts",
	".test.ts",
	".d.ts",
	"tests",
	".git",
];

/**
 * @param {string} dir
 * @returns {string}
 */
function* getAllFiles(dir = __dirname) {
	const dirents = readdirSync(dir, { withFileTypes: true });

	for (const dirent of dirents) {
		if (ignore.some((value) => dirent.name.endsWith(value))) continue;

		const res = resolve(dir, dirent.name);

		if (dirent.isDirectory()) yield* getAllFiles(res);
		else yield res;
	}
}

for (const originalFilePath of getAllFiles()) {
	const parts = originalFilePath.split(".");
	parts[parts.length - 1] = parts[parts.length - 1].replace(/mts/, "ts");

	const newFilePath = parts.join(".");

	if (originalFilePath === newFilePath) continue;

	console.log("New file path =", newFilePath);

	renameSync(originalFilePath, newFilePath);
}
