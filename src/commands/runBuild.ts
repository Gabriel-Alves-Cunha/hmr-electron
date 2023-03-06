import type { ConfigProps } from "types/config.js";

import { runEsbuildForMainProcess } from "./runEsbuildForMainProcess.js";
import { runViteFrontendBuild } from "./runViteFrontendBuild.js";

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Main function:

export async function runBuild(config: ConfigProps): Promise<void> {
	await Promise.all([
		runEsbuildForMainProcess({ ...config, isBuild: true }),

		runViteFrontendBuild(config),
	]);
}
