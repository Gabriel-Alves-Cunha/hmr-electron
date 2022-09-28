import { resolve } from "node:path";

import { configFilePathNotFound, prettyPrintStringArray } from "#common/logs";
import { defaultPathsForConfig, findPathOrExit } from "#common/findPathOrExit";
import { blue, bold, green, yellow } from "#utils/cli-colors";
import { dbg, stringifyJson } from "#utils/debug";
import { makeConfigProps } from "#common/config";
import { readConfigFile } from "#common/readConfigFile";
import { cleanCache } from "#commands/cleanCache";
import { runBuild } from "#commands/runBuild";
import { runDev } from "#commands/runDev";

import { name, version } from "../package.json" assert { type: "json" };

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export async function parseCliArgs(): Promise<void> {
	const args = argsAsObj(usefullArgs());

	//////////////////////////////////////////
	// If only 'hmr-electron' was passed:
	if (Object.keys(args).length === 0)
		return printHelpMsg();

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Read config file for next commands:

	const configFilePathFromArgs = args["--config-file"];
	const configFilePath = configFilePathFromArgs ?
		resolve(configFilePathFromArgs as string) :
		findPathOrExit(defaultPathsForConfig, configFilePathNotFound());

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

	printHelpMsg();
	console.log(
		`No commands matched. Args = ${prettyPrintStringArray(process.argv)}`,
	);
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Helper functions:

function usefullArgs(): string[] {
	const args = process.argv;
	const reversedArgs = args.slice().reverse();

	dbg(`Original args = ${prettyPrintStringArray(args)}`);

	let indexToSliceFrom = 0;
	for (const arg of reversedArgs) {
		dbg({ arg, nameToMatch: name, index: arg.lastIndexOf(name) });

		const indexOfThisPkgCommand = arg.lastIndexOf(name);

		if (indexOfThisPkgCommand === -1)
			continue;

		++indexToSliceFrom;
		break;
	}

	const argsToUse = args.slice(indexToSliceFrom + 1);
	dbg(
		`Modified args = ${
			prettyPrintStringArray(argsToUse)
		}\nindexToSliceFrom = ${indexToSliceFrom}`,
	);

	return argsToUse;
}

//////////////////////////////////////////

function argsAsObj(args: string[]): Record<string, string | boolean> {
	const obj: Record<string, string | boolean> = {};

	args.forEach(arg => {
		const [key, value] = arg.split("=");

		if (!key) return;

		if (!value) obj[key] = true;
		else obj[key] = value;
	});

	console.log("argsAsObj =", stringifyJson(obj));

	return obj;
}

//////////////////////////////////////////

function printHelpMsg() {
	console.log(`\
${bold(blue(name))} version ${version}

${yellow("⚡")} Start developing your Electron + Vite app.

${bold("Usage")}: ${name} [command] [options]

  You must have an ${blue("hmr-electron.config.(ts|js|json)")}
  file at the root of your package.

${bold("Commands:")}
  dev   [--config-file${greenEqual}<configFilePath>] [--clean-cache]
  build [--config-file${greenEqual}<configFilePath>]
  clean [--config-file${greenEqual}<configFilePath>]`);
}

const greenEqual = green("=");
