import type { ConfigProps } from "types/config.js";

import { type ChildProcess, spawn } from "node:child_process";
import { exit, kill } from "node:process";
import { Transform } from "node:stream";

import { prettyPrintStringArray } from "@common/logs.js";
import { removeJunkLogs } from "@utils/removeJunkLogs.js";
import { hmrElectronLog } from "@common/logs.js";
import { dbg } from "@utils/debug.js";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export function killPreviousElectronAndStartANewOne({
	devBuildElectronEntryFilePath,
	electronOptions,
	isTest = false,
}: StartElectronProps): Readonly<ChildProcess> {
	// TODO: make sure mem usage is ok!
	// logDbg(
	// 	"hmr-electron memory usage:",
	// 	process.memoryUsage(),
	// 	"\nresource usage:",
	// 	process.resourceUsage(),
	// );
	///////////////////////////////////////////

	killPreviousElectronProcesses();

	///////////////////////////////////////////

	const electron_process = spawn(
		"electron",
		isTest ? [""] : [...electronOptions, devBuildElectronEntryFilePath],
	)
		.on("exit", exit) // This will kill "hmr-electron".
		.on("spawn", () => {
			const isFirstTime = previousElectronProcesses.size === 0;

			previousElectronProcesses.set(
				electron_process.pid as number,
				electron_process,
			);

			hmrElectronLog(`Electron ${isFirstTime ? "" : "re"}loaded.`);

			dbg(
				`Electron child process has been spawned with args: ${prettyPrintStringArray(
					electron_process.spawnargs,
				)}`,
			);
		});

	///////////////////////////////////////////
	///////////////////////////////////////////

	const removeElectronLoggerJunkOutput = new Transform(removeJunkLogs);
	const removeElectronLoggerJunkErrors = new Transform(removeJunkLogs);

	electron_process.stdout
		.pipe(removeElectronLoggerJunkOutput)
		.pipe(process.stdout);
	electron_process.stderr
		.pipe(removeElectronLoggerJunkErrors)
		.pipe(process.stderr);

	///////////////////////////////////////////
	///////////////////////////////////////////

	return electron_process;
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Constants:

const previousElectronProcesses: Map<number, ChildProcess> = new Map();

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Helper functions:

function killPreviousElectronProcesses(): void {
	for (const [pid, electron_process] of previousElectronProcesses)
		try {
			electron_process.removeAllListeners(); // This is very much needed! An EPIPE error always appear without it.
			electron_process.on("exit", () => previousElectronProcesses.delete(pid));

			kill(pid);
		} catch (e) {
			hmrElectronLog("Error killing Electron process:", e);
		}
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

export type StartElectronProps = Readonly<ConfigProps & { isTest?: boolean }>;

///////////////////////////////////////////

export type StopElectronFn = () => void;
