import type { UserProvidedConfigProps } from "types/config";

import { existsSync, rmSync } from "node:fs";
import { buildSync } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { logConfig, stringifyJson } from "@utils/debug";
import { throwPrettyError } from "@common/logs";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function readConfigFile(
	filePath: string,
): Promise<UserProvidedConfigProps> {
	if (!existsSync(filePath))
		throwPrettyError(`There must be a config file! Received: "${filePath}"`);

	// '.mjs' to force node to read the file as es-module.
	const outfile = join(tmpdir(), "config-file-hmr-electron.mjs");
	let hasTranspilationHappened = false;

	try {
		///////////////////////////////////////////
		///////////////////////////////////////////
		// Transpiling from ts -> js:

		if (tsExtensions.some((ext) => filePath.endsWith(ext))) {
			buildSync({
				minifyIdentifiers: false,
				minifyWhitespace: false,
				entryPoints: [filePath],
				minifySyntax: false,
				treeShaking: true,
				sourcemap: false,
				target: "esnext",
				logLevel: "info",
				platform: "node",
				charset: "utf8",
				format: "esm",
				watch: false,
				logLimit: 10,
				color: true,
				write: true,
				outfile,
				// If ever needed, use imports from the user's node_modules. Check
				// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L931
				// at plugins.
			});

			hasTranspilationHappened = true;
		}

		///////////////////////////////////////////
		///////////////////////////////////////////

		const { default: userConfig }: ConfigFromModule = await import(
			hasTranspilationHappened ? outfile : filePath
		);

		logConfig(`User config = ${stringifyJson(userConfig)}`);

		if (!userConfig) throwPrettyError("Config file is required!");
		if (!userConfig.electronEntryFilePath)
			throwPrettyError("`config.electronEntryFilePath` is required!");

		return userConfig;
	} catch (e) {
		return throwPrettyError(e);
	} finally {
		// Removing temp file:
		if (hasTranspilationHappened) rmSync(outfile);
	}
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helpers:

const tsExtensions = [".ts", ".mts", ".cts"] as const;

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

type ConfigFromModule = Readonly<{
	default: UserProvidedConfigProps | undefined;
}>;
