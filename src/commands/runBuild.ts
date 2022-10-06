import type { ConfigProps } from "types/config";

import { runEsbuildForMainProcess } from "./esbuild";
import { diagnoseErrors } from "@common/diagnoseErrors";
import { runViteBuild } from "./subCommands/runViteBuild";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runBuild(config: ConfigProps): Promise<void> {
	await Promise.all([
		await runEsbuildForMainProcess(
			{ ...config, isBuild: true },
			diagnoseErrors,
			() => {},
		),

		await runViteBuild(config),
	]);
}
