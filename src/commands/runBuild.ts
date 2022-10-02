import type { ConfigProps } from "#types/config";

import { log } from "node:console";

import { bgYellow, black, bold, green } from "#utils/cli-colors";
import { runEsbuildForMainProcess } from "./esbuild";
import { diagnoseErrors } from "#common/diagnoseErrors";
import { getPrettyDate } from "#utils/getPrettyDate";
import { startElectron } from "#commands/subCommands/startElectron";
import { runViteBuild } from "./subCommands/runViteBuild";
import { prompt } from "#common/prompt";
import {
	viteConfigFileNotFound,
	entryFilePathNotFound,
	finishBuildMessage,
} from "#common/logs";
import {
	defaultPathsForViteConfigFile,
	entryFileDefaultPlaces,
	findPathOrExit,
} from "#common/findPathOrExit";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runBuild(config: ConfigProps): Promise<void> {
	findPathOrExit(
		[config.viteConfigPath, ...defaultPathsForViteConfigFile],
		viteConfigFileNotFound(config.cwd),
	);

	findPathOrExit(
		[config.electronEntryFilePath, ...entryFileDefaultPlaces],
		entryFilePathNotFound(config.electronEntryFilePath),
	);

	await runEsbuildForMainProcess(
		{ ...config, isBuild: true },
		diagnoseErrors,
		() => {},
	);

	await runViteBuild(config);
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper functions:

let stopPromptToRunElectron: () => void = () => {};

export async function promptToRerunElectron(
	config: ConfigProps,
	count: number,
) {
	stopPromptToRunElectron();

	log(getPrettyDate(), finishBuildMessage);

	if (count > 1) {
		const [readAnswer, stopPrompt] = prompt(
			`${getPrettyDate()} ${
				bgYellow(black(bold(`[${count}x]`)))
			} ${needToRerunElectron}`,
		);

		stopPromptToRunElectron = stopPrompt;

		if (await readAnswer())
			await startElectron(config);
	} else {
		await startElectron(config);
	}
}

///////////////////////////////////////////

const needToRerunElectron = green("Need to rerun Electron?");
