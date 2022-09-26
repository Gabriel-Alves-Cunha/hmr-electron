import { Command } from "commander";

import { defaultPathsForConfig, findPathOrExit } from "#common/findPathOrExit";
import { entryFilePathNotFound } from "#common/logs";
import { makeConfigProps } from "#common/config";
import { readConfigFile } from "#common/readConfigFile";
import { cleanCache } from "#commands/cleanCache";
import { runBuild } from "#commands/runBuild";
import { runDev } from "#commands/runDev";

import pkg from "../package.json";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

const program = new Command(pkg.name).version(pkg.version);

///////////////////////////////////////////
///////////////////////////////////////////

program
	.command("dev <configFilePath>", { isDefault: true })
	.description(
		"⚡ Start developing your Electron app.\n\n\tYou must have an 'hmr-electron.config.(ts|js|json)' file at the root of your package.",
	)
	.option("--clean-cache")
	.action(
		async (
			configFilePath: string | undefined,
			cli_options: { cleanCache: boolean; },
		) => {
			configFilePath ||= findPathOrExit(
				defaultPathsForConfig,
				entryFilePathNotFound(configFilePath),
			);

			const useConfig = await readConfigFile(configFilePath);

			const configProps = makeConfigProps(useConfig);

			if (cli_options.cleanCache) await cleanCache(configProps);

			await runDev(configProps);
		},
	);

///////////////////////////////////////////

program
	.command("build <configFilePath>")
	.description("Build your Electron main process code in main source.")
	.action(async (configFilePath: string | undefined) => {
		configFilePath ||= findPathOrExit(
			defaultPathsForConfig,
			entryFilePathNotFound(configFilePath),
		);

		const config = await readConfigFile(configFilePath);
		const configProps = makeConfigProps(config);

		await cleanCache(configProps);

		await runBuild(configProps);
	});

///////////////////////////////////////////

program.command("clean").action(cleanCache);

///////////////////////////////////////////

program.addHelpText("beforeAll", `Repository: ${pkg.repository}\n`);

///////////////////////////////////////////
///////////////////////////////////////////

program.parseAsync(process.argv).then();
