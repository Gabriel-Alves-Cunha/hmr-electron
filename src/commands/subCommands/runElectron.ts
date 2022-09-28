import { ChildProcess, spawn } from "node:child_process";
import { Transform } from "node:stream";

import { removeJunkTransformOptions } from "#utils/removeJunkLogs";
import { gray } from "#utils/cli-colors";

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
	{ electronEntryFile, silent = false }: StartElectronProps,
): Promise<Readonly<[ChildProcess, StopElectronFn]>> {
	stopElectronFns.forEach(stopElectron => stopElectron());

	// TODO: maybe: import electron
	const electronProcess = spawn("electron", ["--color", electronEntryFile]).on(
		"exit",
		code => {
			if (!exitBecauseOfUserCode)
				throw new Error(gray(`Electron exited with code ${code}.`));

			exitBecauseOfUserCode = true;
		},
	);

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

export type StartElectronProps = Readonly<
	{ electronEntryFile: string; silent?: boolean; }
>;

///////////////////////////////////////////

export type StopElectronFn = () => void;
