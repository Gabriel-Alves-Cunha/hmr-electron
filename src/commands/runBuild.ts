import type { ConfigProps } from "#types/config";

import { bgYellow, black, bold, green } from "#utils/cli-colors";
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
// Helper functions:

let stopPromptToRunElectron: () => void = () => {};

export async function promptToRerunElectron(
	config: ConfigProps,
	count: number,
) {
	stopPromptToRunElectron();

	console.log(finishBuildMessage);

	if (count > 1) {
		const [readAnswer, stopPrompt] = prompt(
			bgYellow(black(bold(`[${count}x | ${dateFormatted()}]`))) +
				needToRerunElectron,
		);
		stopPromptToRunElectron = stopPrompt;

		if (await readAnswer())
			await runElectron(config);
	} else {
		await runElectron(config);
	}
}

///////////////////////////////////////////

function dateFormatted() {
	const date = new Date();

	return [
		padTo2Digits(date.getHours()),
		padTo2Digits(date.getMinutes()),
		padTo2Digits(date.getSeconds()),
	]
		.join(":");
}

///////////////////////////////////////////

const needToRerunElectron = green("Need to rerun Electron?");

///////////////////////////////////////////

function padTo2Digits(num: number) {
	return num.toString().padStart(2, "0");
}
