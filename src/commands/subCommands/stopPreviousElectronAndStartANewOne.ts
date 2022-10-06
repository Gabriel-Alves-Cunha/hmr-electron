import type { ConfigProps } from "types/config";

import { type ChildProcess, spawn } from "node:child_process";
import { Transform } from "node:stream";

import { prettyPrintStringArray, throwPrettyError } from "@common/logs";
import { hmrElectronLog } from "@utils/consoleMsgs";
import { removeJunkLogs } from "@utils/removeJunkLogs";
import { logDbg } from "@utils/debug";
import { gray } from "@utils/cli-colors";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export function stopPreviousElectronAndStartANewOne(
	{
		electronEnviromentVariables: env,
		devBuildElectronEntryFilePath,
		electronOptions,
		silent = false,
		isTest = false,
	}: StartElectronProps,
): Readonly<ChildProcess> {
	logDbg(
		"hmr-electron memory usage:",
		process.memoryUsage(),
		"\nresource usage:",
		process.resourceUsage(),
	);

	killPreviousElectronProcesses();

	const electronProcess = spawn(
		"electron",
		isTest ? [""] : [
			...electronOptions,
			devBuildElectronEntryFilePath,
		],
		{ env },
	)
		.on("exit", (code, signal) => {
			code !== 0 && throwPrettyError(
				`Electron exited with code: ${code}, signal: ${signal}.`,
			);

			process.exitCode = code ?? 0; // This will kill hmr-electron.
		})
		.on("error", err => {
			throwPrettyError(
				`Error from child_process running Electron: ${err.message}`,
			);
		})
		.on("spawn", () => {
			previousElectronProcesses.set(
				electronProcess.pid as number,
				electronProcess,
			);

			hmrElectronLog(
				gray(
					"Electron process has been spawned!",
				),
			);
			logDbg(
				`Electron child process has been spawned with args: ${
					prettyPrintStringArray(electronProcess.spawnargs)
				}`,
			);
		});

	if (!silent) {
		const removeElectronLoggerJunkOutput = new Transform(
			removeJunkLogs,
		);
		const removeElectronLoggerJunkErrors = new Transform(
			removeJunkLogs,
		);

		electronProcess.stdout.pipe(removeElectronLoggerJunkOutput).pipe(
			process.stdout,
		);
		electronProcess.stderr.pipe(removeElectronLoggerJunkErrors).pipe(
			process.stderr,
		);
	}

	return electronProcess;
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
	previousElectronProcesses.forEach((electronProcess, pid) => {
		if (electronProcess.killed) previousElectronProcesses.delete(pid);

		electronProcess.removeAllListeners();
		logDbg(
			"electron child process listeners names:",
			electronProcess.eventNames(),
		);
		process.kill(pid, 0);
	});
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

export type StartElectronProps = Readonly<
	ConfigProps & {
		silent?: boolean;
		isTest?: boolean;
	}
>;

///////////////////////////////////////////

export type StopElectronFn = () => void;
