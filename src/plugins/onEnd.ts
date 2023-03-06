import type { CompileError } from "@common/formatCompileError.js";
import type { BuildProps } from "@commands/runEsbuildForMainProcess.js";
import type { Plugin } from "esbuild";

import { stopPreviousElectronAndStartANewOne } from "@commands/stopPreviousElectronAndStartANewOne.js";
import { displayErrors } from "@common/diagnoseErrors.js";
import { hmrElectronLog } from "@common/logs.js";

export const onEnd = (props: BuildProps): Plugin =>
	({
		name: "on-end",

		setup(build) {
			let count = 0;

			build.onEnd((result) => {
				hmrElectronLog(`Build nº ${count++}:`);

				result.errors.length &&
					displayErrors(
						result.errors.map(
							(e) =>
								({
									location: e.location,
									message: e.text,
								}) satisfies CompileError,
						),
					);

				stopPreviousElectronAndStartANewOne(props);
			});
		},
	}) satisfies Plugin;
