import commander from "commander";

import { defaultPathsForConfig, findPathOrExit } from "#common/findConfigFile";
import { makeDefaultConfigProps } from "#common/config";
import { entryFilePathNotFound } from "#common/logs";
import { readConfigFile } from "#common/readConfigFile";
import { cleanCache } from "#commands/cleanCache";
import { runBuild } from "#commands/runBuild";

import pkg from "../package.json";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

const program = new commander.Command(pkg.name).version(pkg.version);

///////////////////////////////////////////
///////////////////////////////////////////

program
	.command("dev <configFilePath>", { isDefault: true })
	.description("⚡ Start developing your Electron app.")
	.option("--clean-cache", "Clean build cache.")
	.action(
		async (
			configFilePath: string | undefined,
			options: { cleanCache: boolean; },
		) => {
			configFilePath ||= findPathOrExit(
				defaultPathsForConfig,
				entryFilePathNotFound(configFilePath),
			);

			const config = await readConfigFile(configFilePath);

			// TODO: make a fn to resolve the paths when the user has provided the config file.
			const configProps = makeDefaultConfigProps(config);

			if (options.cleanCache) await cleanCache(configProps);

			await runDev(config);
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
		const configProps = makeDefaultConfigProps(config);

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
