import type { ConfigProps } from "types/config";

import { runEsbuildForMainProcess } from "./runEsbuildForMainProcess";
import { runViteFrontendBuild } from "./runViteFrontendBuild";

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
