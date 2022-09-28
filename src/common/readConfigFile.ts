import type { UserProvidedConfigProps } from "#types/config";

import { existsSync, rmSync } from "node:fs";
import { extname } from "node:path";
import { build } from "esbuild";

import { makeTempFileWithData } from "#utils/makeTempFileWithData";
import { blue, bold, green } from "#utils/cli-colors";
import { stringifyJson } from "#utils/debug";
import { prettyError } from "./logs";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

/** Loads the config from the file as a default export. */
export async function readConfigFile(
	filePath: string,
): Promise<UserProvidedConfigProps> {
	if (!filePath || !existsSync(filePath))
		throw new Error(`There must be a config file! Received: "${filePath}"`);

	let filenameChanged = false;

	try {
		///////////////////////////////////////////
		///////////////////////////////////////////
		// Transpiling from ts -> js:

		if (tsExtensions.includes(extname(filePath))) {
			console.log(blue("Transpiling config file!"));

			const buildResult = await build({
				entryPoints: [filePath],
				format: "esm",
				write: false,
				color: true,
			});

			const [outputFile] = buildResult.outputFiles;

			if (!outputFile)
				throw prettyError(
					`Output for transpiling ts -> js on 'readConfigFile()' not present! ${
						stringifyJson(buildResult)
					}`,
				);

			const { text } = outputFile;

			console.log(green(`Text result from readConfigFile:\n\n${bold(text)}`));

			///////////////////////////////////////////
			///////////////////////////////////////////
			// Writing to a temp file to be read by js native dyn import:

			filePath = makeTempFileWithData(".mjs", text);
			filenameChanged = true;

			console.log(blue("Done transpiling config file!"));
		}

		///////////////////////////////////////////
		///////////////////////////////////////////

		const options = filenameChanged ? {} : { assert: { type: "json" } };
		const { default: config }: ConfigFromModule = await import(
			filePath,
			options
		);

		console.log(green(`Config = ${stringifyJson(config)}`));

		if (!config)
			throw prettyError("Config file is required!");
		if (!config.electronEntryFilePath)
			throw prettyError("config.electronEntryFilePath is required!");

		return config;
	} catch (error) {
		throw prettyError(String(error));
	} finally {
		if (filenameChanged) rmSync(filePath);
	}
}

const tsExtensions = [".ts", ".mts", ".cts"];

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

type ConfigFromModule = { default: UserProvidedConfigProps | undefined; };
