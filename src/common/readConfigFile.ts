import type { UserProvidedConfigProps } from "types/config";

import { existsSync, rmSync } from "node:fs";
import { extname } from "node:path";
import { build } from "esbuild";

import { logDbg, stringifyJson } from "@utils/debug";
import { makeTempFileWithData } from "@utils/makeTempFileWithData";
import { throwPrettyError } from "./logs";
import { bold, green } from "@utils/cli-colors";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function readConfigFile(
	filePath: string,
): Promise<UserProvidedConfigProps> {
	!existsSync(filePath) &&
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
				sourcemap: false,
				logLevel: "info",
				target: "esnext",
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

			logDbg(green(`Text result from readConfigFile():\n${bold(text)}\n`));

			///////////////////////////////////////////
			///////////////////////////////////////////
			// Writing to a temp file to be read by js native dyn import:

			filePath = makeTempFileWithData(".mjs", text);
			filenameChanged = true;
		}

		///////////////////////////////////////////
		///////////////////////////////////////////

		const { default: userConfig }: ConfigFromModule = await import(filePath);

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
