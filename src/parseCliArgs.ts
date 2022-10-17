import { resolve } from "node:path";
import { argv } from "node:process";
import { log } from "node:console";

import { defaultPathsForConfig, findPathOrExit } from "@common/findPathOrExit";
import { blue, bold, green, yellow } from "@utils/cli-colors";
import { configFilePathNotFound } from "@common/logs";
import { dbg, stringifyJson } from "@utils/debug";
import { makeConfigProps } from "@common/config";
import { hmrElectronLog } from "@common/logs";
import { readConfigFile } from "@common/readConfigFile";
import { cleanCache } from "@commands/cleanCache";
import { runBuild } from "@commands/runBuild";
import { runDev } from "@commands/runDev";

import { name, version } from "../package.json";

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export async function parseCliArgs(): Promise<void> {
	const args = argsAsObj(argv.slice(2));

	//////////////////////////////////////////
	// If only "hmr-electron" was passed:

	if (Object.keys(args).length === 0)
		return printHelpMsg();

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Read config file for next commands:

	const configFilePathFromArgs = args["--config-file"];
	const configFilePath = configFilePathFromArgs ?
		resolve(configFilePathFromArgs as string) :
		findPathOrExit(defaultPathsForConfig, configFilePathNotFound);

	const userConfig = await readConfigFile(configFilePath);

	const configProps = makeConfigProps(userConfig);

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Clean command:

	if (args["clean"])
		return await cleanCache(configProps);

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Dev command:

	if (args["dev"]) {
		if (args["--clean-cache"]) await cleanCache(configProps);

		return await runDev(configProps);
	}

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Build command:

	if (args["build"]) {
		await cleanCache(configProps);

		return await runBuild(configProps);
	}

	//////////////////////////////////////////
	//////////////////////////////////////////

	hmrElectronLog(
		`No commands matched. Args = ${args}`,
	);
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Helper functions:

function argsAsObj(args: string[]): Record<string, string | boolean> {
	const obj: Record<string, string | boolean> = {};

	args.forEach(arg => {
		const [key, value] = arg.split("=");

		if (!key) return;

		if (!value) obj[key] = true;
		else if (value === "false") obj[key] = false;
		else obj[key] = value;
	});

	dbg("argsAsObj =", stringifyJson(obj));

	return obj;
}

//////////////////////////////////////////

function printHelpMsg() {
	log(`\
${bold(blue(name))} version ${version}

${yellow("⚡")} Start developing your Electron + Vite app.

${bold("Usage:")} ${name} [command] [options]

  You must have an ${blue("hmr-electron.config.(ts|js)")}
  file at the root of your package.

${bold("Commands and options:")}
  dev   [--config-file${greenEqual}<configFilePath>] [--clean-cache]
  build [--config-file${greenEqual}<configFilePath>]
  clean [--config-file${greenEqual}<configFilePath>]`);
}

const greenEqual = green("=");
