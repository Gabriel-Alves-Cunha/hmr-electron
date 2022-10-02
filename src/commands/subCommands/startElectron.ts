import type { ConfigProps } from "#types/config";

import { type ChildProcess, spawn } from "node:child_process";
import { Transform } from "node:stream";
import { log } from "node:console";

import { throwPrettyError } from "#common/logs";
import { removeJunkLogs } from "#utils/removeJunkLogs";
import { getPrettyDate } from "#utils/getPrettyDate";
import { gray } from "#utils/cli-colors";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Constants:

const stopElectronFns: StopElectronFn[] = [];
let exitBecauseOfUserCode = false;

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function startElectron(
	{
		devBuildElectronEntryFilePath,
		electronEnviromentVariables,
		electronOptions,
		silent = false,
		isTest = false,
	}: StartElectronProps,
): Promise<Readonly<[ChildProcess, StopElectronFn]>> {
	stopElectronFns.forEach(stopFn => stopFn());

	if (electronOptions.length === 0)
		electronOptions = [
			"--enable-source-maps",
			"--node-memory-debug",
			"--trace-warnings",
			"--trace-uncaught",
			"--trace-warnings",
			"--inspect",
		];

	const electronProcess = spawn(
		"electron",
		isTest ? [""] : [
			...electronOptions,
			devBuildElectronEntryFilePath,
		],
		{ env: electronEnviromentVariables },
	)
		.on("exit", (code, signal) => {
			if (!exitBecauseOfUserCode)
				throwPrettyError(
					`Electron exited with code: ${code}, signal: ${signal}.`,
				);

			exitBecauseOfUserCode = true;
		})
		.on("close", (code, signal) => {
			log(
				getPrettyDate(),
				gray(
					`Process closed with code: ${code}, signal: ${signal}.`,
				),
			);
			process.exit(code ?? undefined);
		})
		.on("error", err => {
			throwPrettyError(
				`Error from child_process running Electron: ${err.message}`,
			);
		});

	electronProcess.stdout.on("data", data => {
		log(getPrettyDate(), data);
	});

	function createStopElectronFn(): () => void {
		let called = false;

		return () => {
			if (!called && electronProcess.pid) {
				electronProcess.removeAllListeners();
				process.kill(electronProcess.pid);
				exitBecauseOfUserCode = true;
			}

			called = true;
		};
	}

	const stopElectronFn = createStopElectronFn();
	stopElectronFns.push(stopElectronFn);

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

	return [electronProcess, stopElectronFn];
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Types:

export type StartElectronProps = Readonly<
	ConfigProps & { silent?: boolean; isTest?: boolean; }
>;

///////////////////////////////////////////

export type StopElectronFn = () => void;
