import type { ConfigProps } from "#types/config";

import { runEsbuildForMainProcess } from "./esbuild";
import { finishBuildMessage } from "#common/logs";
import { diagnoseErrors } from "#common/diagnoseErrors";
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
// Helper function:

let stopPromptToRunElectron: () => void = () => {};

export async function promptToRerunElectron(
	electronEntryFile: string,
	count: number,
) {
	stopPromptToRunElectron();

	console.log(finishBuildMessage);

	if (count > 1) {
		const [readAnswer, stopPrompt] = prompt(
			`[x${count}] Need to rerun Electron?`,
		);
		stopPromptToRunElectron = stopPrompt;

		if (await readAnswer()) await runElectron({ electronEntryFile });
	} else {
		await runElectron({ electronEntryFile });
	}
}
