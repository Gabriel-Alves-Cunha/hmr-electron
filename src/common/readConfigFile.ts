import type { UserProvidedConfigProps } from "#types/config";

import { existsSync, rmSync } from "node:fs";
import { extname } from "node:path";
import { build } from "esbuild";

import { logDbg, stringifyJson } from "#utils/debug";
import { makeTempFileWithData } from "#utils/makeTempFileWithData";
import { throwPrettyError } from "./logs";
import { bold, green } from "#utils/cli-colors";
import { require } from "#src/require";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

/** Loads the config from the file as a default export. */
export async function readConfigFile(
	filePath: string,
): Promise<UserProvidedConfigProps> {
	if (!filePath || !existsSync(filePath))
		throwPrettyError(`There must be a config file! Received: "${filePath}"`);

	let filenameChanged = false;

	try {
		///////////////////////////////////////////
		///////////////////////////////////////////
		// Transpiling from ts -> js:

		if (tsExtensions.includes(extname(filePath))) {
			const buildResult = await build({
				minifyIdentifiers: false,
				minifyWhitespace: false,
				entryPoints: [filePath],
				minifySyntax: false,
				treeShaking: true,
				logLevel: "debug",
				target: "esnext",
				sourcemap: false,
				platform: "node",
				charset: "utf8",
				format: "cjs",
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

			logDbg(green(`Text result from readConfigFile():\n${bold(text)}\n`));

			///////////////////////////////////////////
			///////////////////////////////////////////
			// Writing to a temp file to be read by js native dyn import:

			filePath = makeTempFileWithData(".js", text);
			filenameChanged = true;
		}

		///////////////////////////////////////////
		///////////////////////////////////////////

		const { default: userConfig }: ConfigFromModule = require(filePath);

		logDbg(green(`User config = ${stringifyJson(userConfig)}`));

		if (!userConfig)
			throwPrettyError("Config file is required!");
		if (!userConfig.electronEntryFilePath)
			throwPrettyError("config.electronEntryFilePath is required!");

		return userConfig;
	} catch (err) {
		return throwPrettyError(err);
	} finally {
		if (filenameChanged) rmSync(filePath);
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

type ConfigFromModule = { default: UserProvidedConfigProps | undefined; };
