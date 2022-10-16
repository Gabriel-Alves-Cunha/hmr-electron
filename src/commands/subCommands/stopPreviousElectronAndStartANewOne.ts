import type { ConfigProps } from "types/config";

import { type ChildProcess, spawn } from "node:child_process";
import { Transform } from "node:stream";
import { kill, exit } from "node:process";

import { prettyPrintStringArray } from "@common/logs";
import { hmrElectronLog } from "@common/logs";
import { removeJunkLogs } from "@utils/removeJunkLogs";
import { gray } from "@utils/cli-colors";
import { dbg } from "@utils/debug";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export function stopPreviousElectronAndStartANewOne(
	{
		electronEnviromentVariables: env,
		devBuildElectronEntryFilePath,
		electronOptions,
		isTest = false,
	}: StartElectronProps,
): Readonly<ChildProcess> {
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
		isTest ? [""] : [
			...electronOptions,
			devBuildElectronEntryFilePath,
		],
		{ env },
	)
		.on("exit", code => {
			previousElectronProcesses.delete(electron_process.pid as number);

			// If the user closes the Electron window, we should kill "hmr-electron":
			code === 0 && exit(0);
		})
		.on("spawn", () => {
			previousElectronProcesses.set(
				electron_process.pid as number,
				electron_process,
			);

			hmrElectronLog(
				gray(
					"Electron process has been spawned!",
				),
			);
			dbg(
				`Electron child process has been spawned with args: ${
					prettyPrintStringArray(electron_process.spawnargs)
				}`,
			);
		});

	///////////////////////////////////////////
	///////////////////////////////////////////

	const removeElectronLoggerJunkOutput = new Transform(removeJunkLogs);
	const removeElectronLoggerJunkErrors = new Transform(removeJunkLogs);

	electron_process.stdout.pipe(removeElectronLoggerJunkOutput).pipe(
		process.stdout,
	);
	electron_process.stderr.pipe(removeElectronLoggerJunkErrors).pipe(
		process.stderr,
	);

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
	previousElectronProcesses.forEach((_electron_process, pid) => {
		try {
			kill(pid);
		} catch (e) {
			hmrElectronLog("Error when killing process:", e);
		}
	});
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

export type StartElectronProps = Readonly<ConfigProps & { isTest?: boolean; }>;

///////////////////////////////////////////

export type StopElectronFn = () => void;
