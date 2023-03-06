import type { UserProvidedConfigProps } from "types/config.js";

import { existsSync, rmSync } from "node:fs";
import { buildSync } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { throwPrettyError } from "@common/logs.js";
import { logConfig } from "@utils/debug.js";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function readConfigFile(
	configFilePath: string,
): Promise<UserProvidedConfigProps> {
	if (!existsSync(configFilePath))
		throwPrettyError(
			`There must be a config file! Received: "${configFilePath}"`,
		);

	let hasTranspilationHappened = false;
	// outfile has to be '.mjs' to force node to read the file as es-module.
	let outfile = "";

	// If is typescript, transpile to javascript:
	if (
		([".ts", ".mts", ".cts"] as const).some((tsExtension) =>
			configFilePath.endsWith(tsExtension),
		)
	) {
		outfile = join(tmpdir(), "config-file-hmr-electron.mjs");
		hasTranspilationHappened = true;

		buildSync({
			entryPoints: [configFilePath],
			minifyIdentifiers: false,
			minifyWhitespace: false,
			minifySyntax: false,
			logLevel: "warning",
			treeShaking: true,
			sourcemap: false,
			target: "esnext",
			platform: "node",
			charset: "utf8",
			format: "esm",
			logLimit: 10,
			color: true,
			write: true,
			outfile,
			// If ever needed, use imports from the user's node_modules. Check
			// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L931
			// at plugins.
		});
	}

	///////////////////////////////////////////
	///////////////////////////////////////////

	const { default: userConfig }: ConfigFromModule = await import(
		hasTranspilationHappened ? outfile : configFilePath
	)
		.catch(throwPrettyError)
		.finally(() => hasTranspilationHappened && rmSync(outfile));

	logConfig("User config =", userConfig);

	if (!userConfig) throwPrettyError("Config file is required!");
	if (!userConfig.electronEntryFilePath)
		throwPrettyError("`config.electronEntryFilePath` is required!");

	return userConfig;
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

type ConfigFromModule = Readonly<{
	default: UserProvidedConfigProps | undefined;
}>;
