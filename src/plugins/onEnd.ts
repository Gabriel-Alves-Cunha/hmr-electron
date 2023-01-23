import type { BuildProps } from "@commands/runEsbuildForMainProcess";
import type { Plugin } from "esbuild";

import { stopPreviousElectronAndStartANewOne } from "@commands/stopPreviousElectronAndStartANewOne";
import { diagnoseErrors } from "@common/diagnoseErrors";
import { hmrElectronLog } from "@common/logs";
import { CompileError } from "@common/formatCompileError";

export const onEnd = (props: BuildProps): Plugin =>
	({
		name: "on-end",

		setup(build) {
			let count = 0;

			build.onEnd((result) => {
				hmrElectronLog(`Build nº ${count++}:`);

				if (result.errors.length) {
					const errors = result.errors.map(
						(e) =>
							({
								location: e.location,
								message: e.text,
							}) satisfies CompileError,
					);

					diagnoseErrors(errors);
				}

				stopPreviousElectronAndStartANewOne(props);
			});
		},
	}) satisfies Plugin;
