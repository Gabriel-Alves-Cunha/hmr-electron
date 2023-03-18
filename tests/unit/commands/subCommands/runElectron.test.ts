import type { ChildProcess } from "node:child_process";

import { describe, expect, it } from "vitest";

import { stopPreviousElectronAndStartANewOne } from "@commands/stopPreviousElectronAndStartANewOne.js";
import { doesProcessExists } from "@tests/unit/doesProcessExists.js";
import { config } from "@tests/unit/config.js";
import { sleep } from "@tests/unit/sleep.js";

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

				expect(doesProcessExists(mostRecent?.pid)).toBe(true);
				expect(doesProcessExists(previous?.pid)).toBe(false);
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

				expect(doesProcessExists(mostRecent?.pid)).toBe(true);
				expect(doesProcessExists(previous?.pid)).toBe(false);
			}
		}

		const last = processList.at(-1);
		last?.kill();
	});
});
