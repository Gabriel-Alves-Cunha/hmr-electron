import type { ConfigProps } from "types/config";

import { runEsbuildForMainProcess } from "./runEsbuildForMainProcess";
import { runViteFrontendBuild } from "./subCommands/runViteFrontendBuild";
import { diagnoseErrors } from "@common/diagnoseErrors";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runBuild(config: ConfigProps): Promise<void> {
	await Promise.all([
		runEsbuildForMainProcess({ ...config, isBuild: true }, diagnoseErrors),

		runViteFrontendBuild(config),
	]);
}
