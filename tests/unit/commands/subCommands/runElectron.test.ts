import type { ChildProcess } from "node:child_process";

import { describe, expect, it } from "vitest";

import { processExists } from "#tests/unit/processExists";
import { startElectron } from "#commands/subCommands/startElectron";
import { config } from "#tests/unit/config";
import { sleep } from "#tests/unit/sleep";

const times = 5;

describe("testing runElectron()", () => {
	it("should run electron correctly synchronously", async () => {
		const processList: ChildProcess[] = [];
		let stopFn = () => {};

		for (let i = 0; i < times; ++i) {
			stopFn();

			const [childProcess, stopElectronFn] = await startElectron({
				silent: true,
				isTest: true,
				...config,
			});

			stopFn = stopElectronFn;
			processList.push(childProcess);
		}

		await sleep(200);

		for (const [index, childProcess] of processList.entries()) {
			if (index + 1 < times)
				expect(await processExists(childProcess.pid)).toBe(false);
			else
				expect(await processExists(childProcess.pid)).toBe(true);
		}

		stopFn();
	});

	it("should run electron correctly concurrently", async () => {
		const processList: ChildProcess[] = [];
		expect.assertions(times);

		return new Promise<void>(async resolve => {
			for (let i = 0; i < times; ++i) {
				const [childProcess, stopElectronFn] = await startElectron({
					silent: true,
					isTest: true,
					...config,
				});

				processList.push(childProcess);

				if (i + 1 === times) {
					await sleep(2_000);

					for (const [index, childProcess] of processList.entries()) {
						if (index + 1 < times)
							expect(await processExists(childProcess.pid)).toBe(false);
						else
							expect(await processExists(childProcess.pid)).toBe(true);
					}

					stopElectronFn();
					resolve();
				}
			}
		});
	});
});
