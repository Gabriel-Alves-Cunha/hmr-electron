import type { ConfigProps } from "#types/config";

import { bgYellow, black, bold, green } from "#utils/cli-colors";
import { runEsbuildForMainProcess } from "./esbuild";
import { finishBuildMessage } from "#common/logs";
import { diagnoseErrors } from "#common/diagnoseErrors";
import { getPrettyDate } from "#utils/getPrettyDate";
import { runElectron } from "#commands/subCommands/runElectron";
import { prompt } from "#common/prompt";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runBuild(config: ConfigProps): Promise<void> {
	await runEsbuildForMainProcess(
		{ ...config, isBuild: true },
		diagnoseErrors,
		promptToRerunElectron,
	);
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

	console.log(getPrettyDate(), finishBuildMessage);

	if (count > 1) {
		const [readAnswer, stopPrompt] = prompt(
			`${getPrettyDate()} ${
				bgYellow(black(bold(`[${count}x]`)))
			} ${needToRerunElectron}`,
		);

		stopPromptToRunElectron = stopPrompt;

		if (await readAnswer())
			await runElectron(config);
	} else {
		await runElectron(config);
	}
}

///////////////////////////////////////////

const needToRerunElectron = green("Need to rerun Electron?");
