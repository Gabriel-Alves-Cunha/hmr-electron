import type { BuildProps } from "@commands/runEsbuildForMainProcess.js";
import type { Plugin } from "esbuild";

import { killPreviousElectronAndStartANewOne } from "@commands/stopPreviousElectronAndStartANewOne.js";
import { hmrElectronLog } from "@common/logs.js";
import { displayErrors } from "@common/diagnoseErrors.js";

export const onEnd = (props: BuildProps): Plugin =>
	({
		name: "on-end",

		setup(build) {
			let count = 1;

			build.onEnd((result) => {
				hmrElectronLog(`Build nº ${count++}.`);

				result.errors.length && displayErrors(result.errors);

				killPreviousElectronAndStartANewOne(props);
			});
		},
	}) satisfies Plugin;
