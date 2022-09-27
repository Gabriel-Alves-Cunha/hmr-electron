import { defaultPathsForConfig, findPathOrExit } from "#common/findPathOrExit";
import { blue, bold, gray, yellow } from "#utils/cli-colors";
import { configFilePathNotFound } from "#common/logs";
import { makeConfigProps } from "#common/config";
import { readConfigFile } from "#common/readConfigFile";
import { cleanCache } from "#commands/cleanCache";
import { runBuild } from "#commands/runBuild";
import { runDev } from "#commands/runDev";

import { name, version } from "../package.json";

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export async function parseCliArgs(): Promise<void> {
	const args = process.argv;

	//////////////////////////////////////////
	// If only 'hmr-electron' was passed:
	if (args.length === 1 && args[0] === name)
		return printHelpMsg();

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Read config file:

	const configFilePath = args[2] ||
		findPathOrExit(defaultPathsForConfig, configFilePathNotFound());

	const userConfig = await readConfigFile(configFilePath);

	const configProps = makeConfigProps(userConfig);

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Clean command:

	if (args[1] === "clean")
		return await cleanCache(configProps);

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Dev command:

	if (args[1] === "dev") {
		if (args.includes("--clean-cache"))
			await cleanCache(configProps);

		return await runDev(configProps);
	}

	//////////////////////////////////////////
	//////////////////////////////////////////
	// Build command:

	if (args[1] === "build") {
		await cleanCache(configProps);

		return await runBuild(configProps);
	}

	console.error("No commands matched");
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Helper functions:

const printHelpMsg = () =>
	console.log(`\
${bold(blue(name))} version ${version}

${yellow("⚡")} Start developing your Electron app.

		You must have an ${blue("hmr-electron.config.(ts|js|json)")}
		file at the root of your package.

	${gray("Usage:")}
	${name} dev <configFilePath> [--clean-cache]
	${name} build <configFilePath>
	${name} clean <configFilePath>`);
