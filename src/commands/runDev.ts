import type { ConfigProps } from "types/config";

import { bgYellow, black, bold, green, magenta } from "@utils/cli-colors";
import { stopPreviousElectronAndStartANewOne } from "@commands/subCommands/stopPreviousElectronAndStartANewOne";
import { type StopPromptFn, askYesNo } from "@common/prompt";
import { runEsbuildForMainProcess } from "./esbuild";
import { startViteServer } from "./subCommands/startViteServer";
import { diagnoseErrors } from "@common/diagnoseErrors";
import { hmrElectronLog } from "@common/logs";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

// TODO: maybe Promise.all()?
export async function runDev(config: ConfigProps): Promise<void> {
	startViteServer(config);

	runEsbuildForMainProcess(
		{ ...config, isBuild: false },
		diagnoseErrors,
		promptToRerunElectron,
	);
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper functions:

const prettyCount = (count: number) => bgYellow(black(bold(`[${count}º]`)));
let stopPreviousPromptToRerunElectron: StopPromptFn = () => {};
let count = 0;

async function promptToRerunElectron(
	config: ConfigProps,
	isWatch: boolean,
): Promise<void> {
	stopPreviousPromptToRerunElectron();
	++count;

	if (count === 1 || !isWatch) {
		stopPreviousElectronAndStartANewOne(config);
		return;
	}

	const [readAnswerFn, stopPromptFn] = await askYesNo({
		question: `${prettyCount(count)} ${needToRerunElectron}`,
	});

	stopPreviousPromptToRerunElectron = stopPromptFn;

	if (await readAnswerFn()) {
		hmrElectronLog(magenta("Reloading Electron..."));
		stopPreviousElectronAndStartANewOne(config);
	} else
		hmrElectronLog(magenta("NOT reloading Electron."));
}

///////////////////////////////////////////

const needToRerunElectron = green("Do you want to rerun Electron?");
