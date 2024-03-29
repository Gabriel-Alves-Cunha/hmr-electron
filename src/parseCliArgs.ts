import { resolve } from "node:path";
import { log } from "node:console";

import { configFilePathNotFound } from "@common/logs.js";
import { stringifyJson } from "@utils/debug";
import { printHelpMsg } from "@utils/printHelpMsg";
import { cleanCache } from "@commands/cleanCache.js";
import { borderX } from "@utils/cli-colors";
import {
	defaultPathsForConfig,
	findPathOrExit,
} from "@common/findPathOrExit.js";

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export async function matchAndRunArgs(
	args: Record<string, string | boolean>,
): Promise<void> {
	if (args["init"])
		return (await import("@commands/makeConfigFile.js")).makeConfigFile();

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Read config file for next commands:

	const configFilePathFromArgs = args["--config-file"];
	const configFilePath = configFilePathFromArgs
		? resolve(configFilePathFromArgs as string)
		: findPathOrExit(defaultPathsForConfig, configFilePathNotFound);

	const userConfig = await (
		await import("@common/readConfigFile.js")
	).readConfigFile(configFilePath);

	const configProps = (
		await import("@common/makeConfigProps.js")
	).makeConfigProps(userConfig);

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Dev command:

	if (args["dev"]) {
		if (args["--clean-cache"]) cleanCache(configProps);

		return await (await import("@commands/runDev.js")).runDev(configProps);
	}

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Build command:

	if (args["build"]) {
		cleanCache(configProps);

		return await (await import("@commands/runBuild.js")).runBuild(configProps);
	}

	//////////////////////////////////////////
	//////////////////////////////////////////

	printHelpMsg();
	log(
		`${borderX}\nNo commands matched. You passed: ${stringifyJson(
			args,
		)}\n${borderX}`,
	);
}
