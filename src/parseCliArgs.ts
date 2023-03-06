import { resolve } from "node:path";
import { argv } from "node:process";
import { log } from "node:console";

import { configFilePathNotFound, hmrElectronLog } from "@common/logs.js";
import { defaultPathsForConfig, findPathOrExit } from "@common/findPathOrExit.js";
import { blue, bold, green, yellow } from "@utils/cli-colors.js";
import { dbg, stringifyJson } from "@utils/debug.js";
import { getObjectLength } from "@utils/getObjectLength.js";
import { cleanCache } from "@commands/cleanCache.js";

import { name, version } from "../package.json";

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export async function parseCliArgs(): Promise<void> {
	const args = argsAsObj();

	//////////////////////////////////////////
	// If only "hmr-electron" was passed:

	if (getObjectLength(args) === 0) return printHelpMsg();

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Init command:

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

	const configProps = (await import("@common/makeConfigProps.js")).makeConfigProps(
		userConfig,
	);

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

	hmrElectronLog(`No commands matched. Args = ${args}`);
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Helper functions:

function argsAsObj(): Record<string, string | boolean> {
	const obj: Record<string, string | boolean> = {};

	for (const arg of argv.slice(2)) {
		const [key, value] = arg.split("=");

		if (!key) continue;

		if (!value) obj[key] = true;
		else if (value === "false") obj[key] = false;
		else obj[key] = value;
	}

	dbg("argsAsObj =", stringifyJson(obj));

	return obj;
}

//////////////////////////////////////////

function printHelpMsg() {
	log(`\
${bold(blue(name))} version ${version}

${yellow("⚡")} Start developing your Electron + Vite app.

${bold("Usage:")} ${name} [command] [options]

  You must have a config file ('${blue("hmr-electron.config.ts")}')
  file at the root of your package.

${bold("Commands and options:")}
  init  ${blue("Make a config file")}
  dev   [--config-file${greenEqual}<configFilePath>] [--clean-cache]
  build [--config-file${greenEqual}<configFilePath>]`);
}

const greenEqual = green("=");
