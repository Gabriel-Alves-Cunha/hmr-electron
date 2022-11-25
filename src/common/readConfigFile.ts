import type { UserProvidedConfigProps } from "types/config";

import { build as buildEsbuild } from "esbuild";
import { extname, join } from "node:path";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";

import { logConfig, stringifyJson } from "@utils/debug";
import { throwPrettyError } from "@common/logs";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function readConfigFile(
	filePath: string,
): Promise<UserProvidedConfigProps> {
	!existsSync(filePath) &&
		throwPrettyError(`There must be a config file! Received: "${filePath}"`);

	const outfile = "config-file-hmr-electron.mjs";
	let hasTranspilationHappened = false;
	const out = join(tmpdir(), outfile);

	try {
		///////////////////////////////////////////
		///////////////////////////////////////////
		// Transpiling from ts -> js:

		if (tsExtensions.includes(extname(filePath))) {
			const buildResult = await buildEsbuild({
				// '.mjs' to force node to read the file as es-module.
				minifyIdentifiers: false,
				minifyWhitespace: false,
				entryPoints: [filePath],
				minifySyntax: false,
				treeShaking: true,
				outdir: tmpdir(),
				sourcemap: false,
				target: "esnext",
				logLevel: "info",
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
			// 			const [outputFile] = buildResult.outputFiles;
			//
			// 			console.log("outputFile =", outputFile);
			//
			// 			if (!outputFile)
			// 				throwPrettyError(
			// 					`Output for transpiling to '.js' on 'readConfigFile()' not present! ${stringifyJson(
			// 						buildResult,
			// 					)}`,
			// 				);
			//
			// 			const { text, path } = outputFile;
			//
			// 			dbg(
			// 				`Text result from readConfigFile() on path '${path}':\n${bold(text)}\n`,
			// 			);

			///////////////////////////////////////////
			///////////////////////////////////////////
			// Writing to a temp file to be read by js native dyn import:

			// '.mjs' to force node to read the file as es-module.
			// filePath = makeTempFileWithData(".mjs", text);
			hasTranspilationHappened = true;
		}

		///////////////////////////////////////////
		///////////////////////////////////////////

		const { default: userConfig }: ConfigFromModule = await import(
			hasTranspilationHappened ? out : filePath
		);

		logConfig(`User config = ${stringifyJson(userConfig)}`);

		if (!userConfig) throwPrettyError("Config file is required!");
		if (!userConfig.electronEntryFilePath)
			throwPrettyError("`config.electronEntryFilePath` is required!");

		return userConfig;
	} catch (e) {
		return throwPrettyError(e);
	}
	// finally {
	// 	// Removing temp file:
	// 	if (hasFilenameChanged) rmSync(filePath);
	// }
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helpers:

const tsExtensions = [".ts", ".mts", ".cts"];

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

type ConfigFromModule = Readonly<{
	default: UserProvidedConfigProps | undefined;
}>;
