import { ChildProcess, spawn } from "node:child_process";
import { Transform } from "node:stream";

import { removeJunkTransformOptions } from "#utils/removeJunkLogs";
import { throwPrettyError } from "#common/logs";
import { gray } from "#utils/cli-colors";
import { ConfigProps } from "#types/config";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Constants:

const stopElectronFns: Array<() => void> = [];
let exitBecauseOfUserCode = false;

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runElectron(
	{
		electronEnviromentVariables,
		electronBuiltEntryFile,
		electronOptions,
		silent = false,
	}: StartElectronProps,
): Promise<Readonly<[ChildProcess, StopElectronFn]>> {
	stopElectronFns.forEach(stopElectron => stopElectron());

	if (electronOptions.length === 0)
		electronOptions = [
			"--enable-source-maps",
			"--node-memory-debug",
			"--trace-warnings",
			"--trace-uncaught",
			"--trace-warnings",
		];

	if (Object.keys(electronEnviromentVariables).length === 0)
		electronEnviromentVariables = { ...process.env, FORCE_COLOR: "2" };
	else
		electronEnviromentVariables = {
			...electronEnviromentVariables,
			...process.env,
		};

	const electronProcess = spawn("electron", [
		...electronOptions,
		electronBuiltEntryFile,
	], { env: electronEnviromentVariables })
		.on("exit", code => {
			if (!exitBecauseOfUserCode)
				throw new Error(gray(`Electron exited with code ${code}.`));

			exitBecauseOfUserCode = true;
		})
		.on("close", (code, signal) => {
			console.log(`Process closed with code ${code}, ${signal}`);
			process.exit(code ?? undefined);
		})
		.on("error", err => {
			throw throwPrettyError(
				"Error from child_process running Electron:\n" + String(err),
			);
		});

	electronProcess.stdout.on("data", data => {
		console.log(data);
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
			removeJunkTransformOptions,
		);
		const removeElectronLoggerJunkErrors = new Transform(
			removeJunkTransformOptions,
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

export type StartElectronProps = Readonly<ConfigProps & { silent?: boolean; }>;

///////////////////////////////////////////

export type StopElectronFn = () => void;
