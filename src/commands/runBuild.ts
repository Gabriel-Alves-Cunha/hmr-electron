import { runEsbuildForMainProcess } from "./esbuild";
import { finishBuildMessage } from "#common/logs";
import { diagnoseErrors } from "#common/diagnoseErrors";
import { runElectron } from "#subCommands/electron/runElectron";
import { ConfigProps } from "#types/config";
import { prompt } from "#common/prompt";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runBuild(
	configProps: Required<ConfigProps>,
): Promise<void> {
	await runEsbuildForMainProcess(
		{ ...configProps, isBuild: true },
		diagnoseErrors,
		buildComplete,
	);
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper function:

let stopPromptToRunElectron: () => void = () => {};

async function buildComplete(electronEntryFile: string, count: number) {
	stopPromptToRunElectron();

	console.log(finishBuildMessage);

	if (count > 1) {
		const [readAnswer, stopPrompt] = prompt("Need to rerun Electron?");
		stopPromptToRunElectron = stopPrompt;

		if (await readAnswer()) await runElectron({ electronEntryFile });
	} else {
		await runElectron({ electronEntryFile });
	}
}
