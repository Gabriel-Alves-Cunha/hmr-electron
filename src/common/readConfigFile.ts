import type { UserProvidedConfigProps } from "types/config";

import { build as buildEsbuild } from "esbuild";
import { existsSync, rmSync } from "node:fs";
import { extname } from "node:path";

import { dbg, logConfig, stringifyJson } from "@utils/debug";
import { makeTempFileWithData } from "@utils/makeTempFileWithData";
import { throwPrettyError } from "@common/logs";
import { bold } from "@utils/cli-colors";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function readConfigFile(
	filePath: string,
): Promise<UserProvidedConfigProps> {
	!existsSync(filePath) &&
		throwPrettyError(`There must be a config file! Received: "${filePath}"`);

	let hasFilenameChanged = false;

	try {
		///////////////////////////////////////////
		///////////////////////////////////////////
		// Transpiling from ts -> js:

		if (tsExtensions.includes(extname(filePath))) {
			// TODO: maybe make esbuild to write the file
			const buildResult = await buildEsbuild({
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
				logLimit: 10,
				write: false,
				color: true,
			});

			const [outputFile] = buildResult.outputFiles;

			if (!outputFile)
				throwPrettyError(
					`Output for transpiling to '.js' on 'readConfigFile()' not present! ${
						stringifyJson(buildResult)
					}`,
				);

			const { text } = outputFile;

			dbg(`Text result from readConfigFile():\n${bold(text)}\n`);

			///////////////////////////////////////////
			///////////////////////////////////////////
			// Writing to a temp file to be read by js native dyn import:

			// '.mjs' to force node to read the file as es-module.
			filePath = makeTempFileWithData(".mjs", text);
			hasFilenameChanged = true;
		}

		///////////////////////////////////////////
		///////////////////////////////////////////

		const { default: userConfig }: ConfigFromModule = await import(filePath);

		logConfig(`User config = ${stringifyJson(userConfig)}`);

		if (!userConfig)
			throwPrettyError("Config file is required!");
		if (!userConfig.electronEntryFilePath)
			throwPrettyError("`config.electronEntryFilePath` is required!");

		return userConfig;
	} catch (e) {
		return throwPrettyError(e);
	} finally {
		// Removing temp file:
		if (hasFilenameChanged) rmSync(filePath);
	}
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

type ConfigFromModule = Readonly<
	{ default: UserProvidedConfigProps | undefined; }
>;
