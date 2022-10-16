import type { ChildProcess } from "node:child_process";

import { describe, expect, it } from "vitest";

import { stopPreviousElectronAndStartANewOne } from "@commands/subCommands/stopPreviousElectronAndStartANewOne";
import { processExists } from "@utils/processExists";
import { config } from "@tests/unit/config";
import { sleep } from "@tests/unit/sleep";

const times = 5;

describe("testing runElectron()", () => {
	it("should run electron correctly synchronously", async () => {
		const processList: ChildProcess[] = [];

		for (let i = 0; i < times; ++i) {
			const electronProcess = stopPreviousElectronAndStartANewOne({
				isTest: true,
				...config,
			});

			processList.push(electronProcess);
			await sleep(200); // Wait for process to be born.

			// The most recent one must be the only one alive!!
			if (i > 0) {
				const previous = processList[i - 1];
				const mostRecent = processList[i];

				expect(mostRecent).toBeTruthy();
				expect(previous).toBeTruthy();

				expect(processExists(mostRecent?.pid)).toBe(true);
				expect(processExists(previous?.pid)).toBe(false);
			}
		}
	});

	it("should run electron correctly concurrently", async () => {
		const processList: ChildProcess[] = [];

		for (let i = 0; i < times; ++i) {
			const electronProcess = stopPreviousElectronAndStartANewOne({
				isTest: true,
				...config,
			});

			processList.push(electronProcess);
			await sleep(200); // Wait for process to be born.

			// The most recent one must be the only one alive!!
			if (i > 0) {
				const previous = processList[i - 1];
				const mostRecent = processList[i];

				expect(mostRecent).toBeTruthy();
				expect(previous).toBeTruthy();

				expect(processExists(mostRecent?.pid)).toBe(true);
				expect(processExists(previous?.pid)).toBe(false);
			}
		}

		const last = processList.at(-1);
		last?.kill();
	});
});